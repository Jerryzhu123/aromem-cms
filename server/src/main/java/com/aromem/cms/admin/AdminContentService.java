package com.aromem.cms.admin;

import com.aromem.cms.common.BizException;
import com.aromem.cms.common.ErrorCode;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * 管理端通用内容 CRUD（P4）。
 *
 * <p><b>设计</b>：8 个内容域共用一套按白名单驱动的 CRUD —— 每个域声明
 * 表名 + 可写字段集合（snake_case 数据库列），前端传 camelCase，
 * 统一转 snake 后过滤，杜绝「字段注入」。富文本字段（content_html）按既定
 * 契约<b>原样存取</b>，不做净化（安全边界在「只有管理员能写」）。
 *
 * <p>所有写操作成功后 {@code site_revision.revision + 1}（前端条件刷新依据）。
 */
@Service
public class AdminContentService {

    /** 域注册表：域名（URL 段）→ 表名。id 列统一为 id。 */
    private static final Map<String, String> DOMAINS = Map.ofEntries(
            Map.entry("articles", "article"),
            Map.entry("products", "product"),
            Map.entry("product-categories", "product_category"),
            Map.entry("projects", "project"),
            Map.entry("pages", "page"),
            Map.entry("downloads", "download"),
            Map.entry("home-slides", "home_slide"),
            Map.entry("home-about-cards", "home_about_card"),
            Map.entry("home-video", "home_video"),
            Map.entry("home-sections", "home_section"),
            Map.entry("home-tiles", "home_tile"),
            Map.entry("fc-series", "fc_series"),
            Map.entry("fc-products", "fc_product"),
            Map.entry("cross-reference", "fc_cross_reference"),
            Map.entry("rfq", "rfq_submission"),
            Map.entry("media", "media_meta"));

    /** 各域可写字段（snake_case；上传类字段前端传 relativeUrl 字符串）。 */
    private static final Map<String, Set<String>> FIELDS = Map.ofEntries(
            Map.entry("articles", Set.of("locale", "source_id", "title", "summary", "cover_url", "content_html",
                    "content_text", "author", "source", "published_at", "is_top", "view_count",
                    "seo_title", "seo_keywords", "seo_description", "status", "sort_order")),
            Map.entry("products", Set.of("locale", "source_id", "category_id", "title", "subtitle", "summary",
                    "cover_url", "content_html", "seo_title", "seo_keywords", "seo_description",
                    "status", "sort_order")),
            Map.entry("product-categories", Set.of("locale", "parent_id", "name", "slug", "sort_order", "visible")),
            Map.entry("projects", Set.of("locale", "source_id", "title", "subtitle", "cover_url", "content_html",
                    "seo_title", "seo_keywords", "seo_description", "status", "sort_order")),
            Map.entry("pages", Set.of("locale", "source_id", "code", "title", "subtitle", "banner_key",
                    "content_html", "seo_title", "seo_keywords", "seo_description", "status", "sort_order")),
            Map.entry("downloads", Set.of("locale", "title", "category", "file_url", "file_size_bytes",
                    "sort_order", "status")),
            Map.entry("home-slides", Set.of("locale", "image_url", "alt", "link_url", "sort_order", "status")),
            Map.entry("home-about-cards", Set.of("locale", "image_url", "title", "body_html", "link_url",
                    "read_more_label", "sort_order")),
            Map.entry("home-video", Set.of("locale", "heading", "body_html", "video_url")),
            Map.entry("home-sections", Set.of("locale", "code", "title", "subtitle", "sort_order", "enabled")),
            Map.entry("home-tiles", Set.of("board", "name_zh", "name_en", "image_url", "link_url",
                    "sort_order", "status")),
            Map.entry("fc-series", Set.of("slug", "name_zh", "name_en", "tagline_zh", "tagline_en",
                    "facets_zh", "facets_en", "sort_order", "coming_soon", "status")),
            Map.entry("rfq", Set.of("status")),
            Map.entry("fc-products", Set.of("series_slug", "model", "slug", "title", "title_zh",
                    "subtitle", "subtitle_zh", "gallery_json", "overall_length", "overall_length_unit",
                    "overall_length_unit_zh", "outside_diameter", "outside_diameter_unit",
                    "outside_diameter_unit_zh", "inner_diameter", "micron_absolute", "micron_nominal",
                    "media_material_json", "end_cap", "connection", "flow_rate_min", "flow_rate_max",
                    "flow_rate_unit", "flow_rate_unit_zh", "max_temperature_c", "max_pressure_drop_psid",
                    "application_industries_json", "compatible_models_json", "documents_json",
                    "certifications_json", "seo_title", "seo_title_zh", "seo_description",
                    "seo_description_zh", "data_status", "status", "sort_order")),
            Map.entry("cross-reference", Set.of("brand", "oem_model", "relation", "note", "note_zh",
                    "surmem_model", "series_slug", "product_slug", "status", "sort_order")),
            Map.entry("media", Set.<String>of()));

    /** 特殊列：不允许出现在 update 的 SET 里（受保护列）。 */
    private static final Set<String> READ_ONLY_COLUMNS = Set.of("id", "created_at", "updated_at", "create_time");

    private static final Pattern COLUMN_SAFE = Pattern.compile("^[a-z][a-z0-9_]*$");

    private final JdbcTemplate jdbc;

    public AdminContentService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public String tableOf(String domain) {
        String table = DOMAINS.get(domain);
        if (table == null) {
            throw new BizException(ErrorCode.NOT_FOUND, "未知管理域: " + domain);
        }
        return table;
    }

    /** camelCase → snake_case（契约：前端传 JSON camelCase，库列 snake_case）。 */
    static String snake(String camel) {
        return camel.replaceAll("([a-z0-9])([A-Z])", "$1_$2").toLowerCase();
    }

    /** 过滤 + 转换 body 为可写列值；空 Map 直接拒绝。 */
    private Map<String, Object> writableColumns(String domain, Map<String, Object> body, boolean forInsert) {
        Set<String> allowed = FIELDS.get(domain);
        Map<String, Object> cols = new LinkedHashMap<>();
        for (Map.Entry<String, Object> e : body.entrySet()) {
            String column = snake(e.getKey());
            if (!allowed.contains(column) || READ_ONLY_COLUMNS.contains(column)) {
                continue;
            }
            cols.put(column, e.getValue());
        }
        if (cols.isEmpty()) {
            throw new BizException(ErrorCode.BAD_REQUEST, "没有可写入的字段");
        }
        if (forInsert) {
            // status 给默认值，避免新增即不可见
            cols.putIfAbsent("status", "PUBLISHED");
        }
        return cols;
    }

    /** 分页列表：支持 locale 过滤、关键词（title/name LIKE）、status 过滤。 */
    public Map<String, Object> list(String domain, String locale, int page, int size,
                                    String keyword, String status) {
        String table = tableOf(domain);
        List<Object> args = new ArrayList<>();
        StringBuilder where = new StringBuilder(" WHERE 1=1");
        boolean hasLocale = tableHasLocale(table);
        if (locale != null && !locale.isBlank() && hasLocale) {
            where.append(" AND locale = ?");
            args.add(locale);
        }
        if (keyword != null && !keyword.isBlank()) {
            // product-category 没有 title 列，按表选关键词列
            String keywordColumn = switch (table) {
                case "product_category" -> "name";
                case "fc_series" -> "name_zh";
                case "home_tile" -> "name_zh";
                case "fc_product" -> "model";
                case "fc_cross_reference" -> "oem_model";
                case "rfq_submission" -> "full_name";
                default -> "title";
            };
            where.append(" AND ").append(keywordColumn).append(" LIKE ?");
            args.add("%" + keyword + "%");
        }
        if (status != null && !status.isBlank() && hasStatus(table)) {
            where.append(" AND status = ?");
            args.add(status);
        }
        long total = jdbc.queryForObject("SELECT COUNT(*) FROM " + table + where, Long.class, args.toArray());
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);
        String orderBy = " ORDER BY id DESC LIMIT ? OFFSET ?";
        List<Map<String, Object>> items = jdbc.queryForList(
                "SELECT * FROM " + table + where + orderBy,
                appendArgs(args, safeSize, (safePage - 1) * safeSize));
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("page", safePage);
        result.put("size", safeSize);
        result.put("total", total);
        result.put("totalPages", (total + safeSize - 1) / safeSize);
        result.put("items", items);
        return result;
    }

    public Map<String, Object> detail(String domain, long id) {
        String table = tableOf(domain);
        List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM " + table + " WHERE id = ?", id);
        if (rows.isEmpty()) {
            throw new BizException(ErrorCode.NOT_FOUND);
        }
        return rows.get(0);
    }

    @Transactional
    public long create(String domain, Map<String, Object> body) {
        String table = tableOf(domain);
        Map<String, Object> cols = writableColumns(domain, body, true);
        validateForInsert(domain, cols);
        // 主体表 source_id 是导入幂等自然键（NOT NULL）：管理端创建未传时自动分配 MAX+1
        if (hasSourceId(domain) && (cols.get("source_id") == null)) {
            Long next = jdbc.queryForObject(
                    "SELECT COALESCE(MAX(source_id), 0) + 1 FROM " + table, Long.class);
            cols.put("source_id", next == null ? 1L : next);
        }
        String columns = String.join(", ", cols.keySet());
        String placeholders = String.join(", ", cols.keySet().stream().map(c -> "?").toList());
        jdbc.update("INSERT INTO " + table + " (" + columns + ") VALUES (" + placeholders + ")",
                cols.values().toArray());
        Long id = jdbc.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
        bumpRevision();
        return id == null ? -1 : id;
    }

    @Transactional
    public void update(String domain, long id, Map<String, Object> body) {
        String table = tableOf(domain);
        detail(domain, id); // 存在性
        Map<String, Object> cols = writableColumns(domain, body, false);
        String setSql = String.join(", ", cols.keySet().stream().map(c -> c + " = ?").toList());
        List<Object> args = new ArrayList<>(cols.values());
        args.add(id);
        jdbc.update("UPDATE " + table + " SET " + setSql + " WHERE id = ?", args.toArray());
        bumpRevision();
    }

    @Transactional
    public void delete(String domain, long id) {
        String table = tableOf(domain);
        detail(domain, id);
        jdbc.update("DELETE FROM " + table + " WHERE id = ?", id);
        bumpRevision();
    }

    // ------------------------------------------------------------------
    // 校验与辅助
    // ------------------------------------------------------------------

    private void validateForInsert(String domain, Map<String, Object> cols) {
        switch (domain) {
            case "pages" -> require(cols, "locale", "code", "title");
            case "product-categories" -> require(cols, "locale", "name");
            case "home-slides", "home-about-cards" -> require(cols, "locale");
            case "home-video" -> require(cols, "locale");
            case "home-sections" -> require(cols, "locale", "code");
            case "fc-series" -> require(cols, "slug", "name_zh");
            case "home-tiles" -> require(cols, "board", "name_zh");
            case "fc-products" -> require(cols, "series_slug", "model", "slug");
            case "cross-reference" -> require(cols, "brand", "oem_model", "surmem_model");
            case "rfq" -> require(cols, "full_name");
            default -> require(cols, "locale", "title");
        }
    }

    private void require(Map<String, Object> cols, String... keys) {
        for (String key : keys) {
            if (cols.get(key) == null || String.valueOf(cols.get(key)).isBlank()) {
                throw new BizException(ErrorCode.BAD_REQUEST, "缺少必填字段: " + key);
            }
        }
    }

    /** 主体表（导入幂等键所在表）。 */
    private boolean hasSourceId(String domain) {
        return domain.equals("articles") || domain.equals("products")
                || domain.equals("projects") || domain.equals("pages");
    }

    private boolean tableHasLocale(String table) {
        return !table.equals("media_meta") && !table.equals("page_banner")
                && !table.equals("fc_series") && !table.equals("rfq_submission")
                && !table.equals("fc_product") && !table.equals("fc_cross_reference")
                && !table.equals("home_tile");
    }

    private boolean hasStatus(String table) {
        return !table.equals("media_meta");
    }

    private void bumpRevision() {
        jdbc.update("UPDATE site_revision SET revision = revision + 1");
    }

    private Object[] appendArgs(List<Object> args, Object... extra) {
        List<Object> all = new ArrayList<>(args);
        all.addAll(List.of(extra));
        return all.toArray();
    }

    /** 供 controller 校验列名安全（防拼接注入的最后一道闸）。 */
    static void assertColumnSafe(String column) {
        if (!COLUMN_SAFE.matcher(column).matches() || READ_ONLY_COLUMNS.contains(column)) {
            throw new BizException(ErrorCode.BAD_REQUEST, "非法字段名: " + column);
        }
    }
}
