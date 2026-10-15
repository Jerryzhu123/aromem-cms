package com.aromem.cms.importer;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 内容导入器：把爬取产物（content.json / home.json / nav.json）灌入 MySQL。
 *
 * <p><b>幂等策略</b>：
 * <ul>
 *   <li>外壳类小表（nav_menu / footer_* / home_* / page_banner）——先清后插，可重复执行；</li>
 *   <li>主体表（article / product / project / page）——按唯一键
 *       {@code (locale, source_id)} / {@code (locale, code)} 做 upsert。</li>
 * </ul>
 *
 * <p><b>标题解析规则</b>（源站 title 是站点通用标题，不是内容标题）：
 * 新闻取正文第一个 &lt;h3&gt;；产品/工程/单页取面包屑最后一段按 {@code -} 拆分取末节；
 * 产品的分类名取面包屑倒数第二段。封面优先取首页聚合里的映射，兜底取正文第一张图。
 */
@Component
public class ContentImporter {

    private static final Logger log = LoggerFactory.getLogger(ContentImporter.class);

    static final String ZH = "zh-CN";
    static final String EN = "en-US";

    private static final Pattern KEY_NEWS = Pattern.compile("^news:(\\d+)$");
    private static final Pattern KEY_EN_NEWS = Pattern.compile("^en-news:(\\d+)$");
    private static final Pattern KEY_PRODUCT = Pattern.compile("^product:(\\d+)$");
    private static final Pattern KEY_EN_PRODUCT = Pattern.compile("^en-product:(\\d+)$");
    private static final Pattern KEY_PROJECT = Pattern.compile("^project:(\\d+)$");
    private static final Pattern KEY_EN_PROJECT = Pattern.compile("^en-project:(\\d+)$");
    private static final Pattern PAGE_CODE = Pattern.compile("^(?:/en)?_?(about[1-4]|join|handbook)\\.html$");

    private final JdbcClient jdbc;
    private final ObjectMapper objectMapper;

    ContentImporter(JdbcClient jdbc, ObjectMapper objectMapper) {
        this.jdbc = jdbc;
        this.objectMapper = objectMapper;
    }

    @Transactional
    void importAll() throws Exception {
        Map<String, ImportDtos.PageDto> content = loadJson("import/content.json", new TypeReference<>() {
        });
        ImportDtos.HomeBundle home = loadJson("import/home.json", new TypeReference<>() {
        });
        ImportDtos.NavBundle nav = loadJson("import/nav.json", new TypeReference<>() {
        });

        importNav(nav);
        importFooter(nav);
        importBanners(content);
        importArticles(content, home);
        importProducts(content, home);
        importProjects(content, home);
        importPages(content);
        importHomeBlocks(home);
        bumpRevision();

        log.info("[importer] 内容导入完成：article={} product={} project={} page={}",
                count("article"), count("product"), count("project"), count("page"));
    }

    private <T> T loadJson(String path, TypeReference<T> type) throws Exception {
        try (InputStream in = new ClassPathResource(path).getInputStream()) {
            return objectMapper.readValue(in, type);
        }
    }

    private long count(String table) {
        return jdbc.sql("SELECT COUNT(*) FROM " + table).query(Long.class).single();
    }

    // ------------------------------------------------------------------
    // 导航
    // ------------------------------------------------------------------

    private void importNav(ImportDtos.NavBundle nav) {
        jdbc.sql("DELETE FROM nav_menu").update();
        insertNavTree(ZH, nav.nav().zh());
        insertNavTree(EN, nav.nav().en());
        log.info("[importer] nav_menu 已导入");
    }

    private void insertNavTree(String locale, List<ImportDtos.NavItemDto> items) {
        int sort = 0;
        for (ImportDtos.NavItemDto item : items) {
            Long id = insertNavItem(locale, null, item.label(), item.href(), sort++);
            if (item.children() != null) {
                int childSort = 0;
                for (ImportDtos.NavItemDto child : item.children()) {
                    insertNavItem(locale, id, child.label(), child.href(), childSort++);
                }
            }
        }
    }

    private Long insertNavItem(String locale, Long parentId, String label, String href, int sort) {
        Target target = targetType(href);
        jdbc.sql("""
                INSERT INTO nav_menu (locale, parent_id, label, target_type, target_value, sort_order, visible)
                VALUES (:locale, :parentId, :label, :targetType, :targetValue, :sort, 1)
                """)
                .param("locale", locale)
                .param("parentId", parentId)
                .param("label", label)
                .param("targetType", target.type())
                .param("targetValue", target.value())
                .param("sort", sort)
                .update();
        return jdbc.sql("""
                        SELECT id FROM nav_menu WHERE locale = :locale AND label = :label
                        ORDER BY id DESC LIMIT 1
                        """)
                .param("locale", locale)
                .param("label", label)
                .query(Long.class)
                .single();
    }

    /** 链接类型推导：源 href 已是克隆路由形式，原样入库。 */
    record Target(String type, String value) {
    }

    private Target targetType(String href) {
        if (href == null || href.isBlank()) {
            return new Target("ROUTE", href == null ? "" : href);
        }
        if (href.startsWith("http://") || href.startsWith("https://")) {
            return new Target("EXTERNAL", href);
        }
        if (href.contains("news_detail?id=")) {
            return new Target("ARTICLE", href);
        }
        if (href.contains("products?id=")) {
            return new Target("PRODUCT", href);
        }
        if (href.contains("projects?id=")) {
            return new Target("PROJECT", href);
        }
        if (PAGE_CODE.matcher(href).matches() || href.matches("^/en/(about[1-3]|join)$")
                || href.matches("^/(about[1-4]|join|handbook)$")) {
            return new Target("PAGE", href);
        }
        return new Target("ROUTE", href);
    }

    // ------------------------------------------------------------------
    // 页脚 + 联系方式
    // ------------------------------------------------------------------

    private void importFooter(ImportDtos.NavBundle nav) {
        jdbc.sql("DELETE FROM footer_column").update();
        jdbc.sql("DELETE FROM footer_link").update();

        insertFooterLocale(ZH, nav.footer().zh());
        insertFooterLocale(EN, nav.footer().en());
        log.info("[importer] footer 与 site_setting 已导入");
    }

    private void insertFooterLocale(String locale, ImportDtos.FooterDto footer) {
        int colSort = 0;
        for (ImportDtos.ColDto col : List.of(footer.col1(), footer.col2(), footer.col3())) {
            if (col == null) {
                continue;
            }
            jdbc.sql("INSERT INTO footer_column (locale, title, sort_order) VALUES (:locale, :title, :sort)")
                    .param("locale", locale).param("title", col.title()).param("sort", colSort++).update();
            Long colId = jdbc.sql("SELECT id FROM footer_column WHERE locale = :locale AND title = :title ORDER BY id DESC LIMIT 1")
                    .param("locale", locale).param("title", col.title()).query(Long.class).single();
            int linkSort = 0;
            for (ImportDtos.LinkDto link : col.links()) {
                Target target = targetType(link.href());
                jdbc.sql("""
                        INSERT INTO footer_link (locale, column_id, label, target_type, target_value, sort_order)
                        VALUES (:locale, :colId, :label, :type, :value, :sort)
                        """)
                        .param("locale", locale).param("colId", colId).param("label", link.label())
                        .param("type", target.type()).param("value", target.value()).param("sort", linkSort++)
                        .update();
            }
        }

        ImportDtos.ContactDto contact = footer.contact();
        if (contact != null) {
            upsertSetting(locale, "contact_title", contact.title());
            upsertSetting(locale, "address", contact.address());
            upsertSetting(locale, "phone", contact.phone());
            upsertSetting(locale, "qr", contact.qr());
            if (contact.emails() != null) {
                upsertSetting(locale, "emails", String.join(",", contact.emails()));
            }
        }
        if (footer.copyright() != null) {
            upsertSetting(locale, "copyright", footer.copyright());
        }
        if (footer.icp() != null) {
            upsertSetting(locale, "icp_label", footer.icp().label());
            upsertSetting(locale, "icp_url", footer.icp().href());
        }
    }

    private void upsertSetting(String locale, String key, String value) {
        if (value == null) {
            return;
        }
        jdbc.sql("""
                INSERT INTO site_setting (locale, setting_key, setting_value)
                VALUES (:locale, :key, :value)
                AS new
                ON DUPLICATE KEY UPDATE setting_value = new.setting_value
                """)
                .param("locale", locale).param("key", key).param("value", value).update();
    }

    // ------------------------------------------------------------------
    // banner（原样 HTML，按内容类型键去重）
    // ------------------------------------------------------------------

    private void importBanners(Map<String, ImportDtos.PageDto> content) {
        Map<String, String> banners = new HashMap<>();
        for (ImportDtos.PageDto page : content.values()) {
            if (page.banner() != null && page.banner().html() != null) {
                String key = page.banner().id().replace("mu-page-header-", "");
                banners.putIfAbsent(key, page.banner().html());
            }
        }
        for (Map.Entry<String, String> e : banners.entrySet()) {
            jdbc.sql("""
                    INSERT INTO page_banner (banner_key, html) VALUES (:key, :html)
                    AS new
                    ON DUPLICATE KEY UPDATE html = new.html
                    """)
                    .param("key", e.getKey()).param("html", e.getValue()).update();
        }
        log.info("[importer] page_banner 已导入 {} 个", banners.size());
    }

    // ------------------------------------------------------------------
    // 新闻
    // ------------------------------------------------------------------

    private void importArticles(Map<String, ImportDtos.PageDto> content, ImportDtos.HomeBundle home) {
        for (Map.Entry<String, ImportDtos.PageDto> entry : content.entrySet()) {
            Matcher m = KEY_NEWS.matcher(entry.getKey());
            String locale = ZH;
            if (!m.find()) {
                m = KEY_EN_NEWS.matcher(entry.getKey());
                if (!m.find()) {
                    continue;
                }
                locale = EN;
            }
            long sourceId = Long.parseLong(m.group(1));
            ImportDtos.PageDto page = entry.getValue();
            ImportDtos.HomeDataDto homeData = locale.equals(ZH) ? home.zh() : home.en();

            String title = ImportHtmlUtils.firstH3Text(page.content());
            if (title == null || title.isBlank()) {
                title = ImportHtmlUtils.titleFromCrumbs(crumbs(page));
            }
            if (title == null || title.isBlank()) {
                log.warn("[importer] 新闻 {} 无法解析标题，跳过", entry.getKey());
                continue;
            }

            String summary = homeData.news() != null
                    ? matchByHref(homeData.news().list(), sourceId).map(ImportDtos.NewsListItemDto::excerpt).orElse(null)
                    : null;
            if (summary == null) {
                summary = ImportHtmlUtils.excerpt(page.content(), 200);
            }
            String cover = homeData.news() != null
                    ? matchByHref(homeData.news().slides(), sourceId).map(ImportDtos.NewsSlideDto::image).orElse(null)
                    : null;
            if (cover == null) {
                cover = ImportHtmlUtils.firstImage(page.content());
            }

            jdbc.sql("""
                    INSERT INTO article (source_id, locale, title, summary, cover_url, content_html, content_text,
                                         seo_title, seo_description, status)
                    VALUES (:sid, :locale, :title, :summary, :cover, :html, :text, :seoTitle, :seoDesc, 'PUBLISHED')
                    AS new
                    ON DUPLICATE KEY UPDATE
                        title = new.title, summary = new.summary, cover_url = new.cover_url,
                        content_html = new.content_html, content_text = new.content_text,
                        seo_title = new.seo_title, seo_description = new.seo_description
                    """)
                    .param("sid", sourceId).param("locale", locale).param("title", title)
                    .param("summary", summary).param("cover", cover)
                    .param("html", page.content()).param("text", ImportHtmlUtils.stripHtml(page.content()))
                    .param("seoTitle", page.title()).param("seoDesc", ImportHtmlUtils.excerpt(page.content(), 200))
                    .update();
        }
        log.info("[importer] article 导入完成");
    }

    // ------------------------------------------------------------------
    // 产品
    // ------------------------------------------------------------------

    private void importProducts(Map<String, ImportDtos.PageDto> content, ImportDtos.HomeBundle home) {
        Map<String, Long> categoryIds = importProductCategories(home, content);

        for (Map.Entry<String, ImportDtos.PageDto> entry : content.entrySet()) {
            Matcher m = KEY_PRODUCT.matcher(entry.getKey());
            String locale = ZH;
            if (!m.find()) {
                m = KEY_EN_PRODUCT.matcher(entry.getKey());
                if (!m.find()) {
                    continue;
                }
                locale = EN;
            }
            long sourceId = Long.parseLong(m.group(1));
            ImportDtos.PageDto page = entry.getValue();
            List<String> crumbs = crumbs(page);

            String title = ImportHtmlUtils.titleFromCrumbs(crumbs);
            String categoryName = ImportHtmlUtils.categoryFromCrumbs(crumbs);
            Long categoryId = categoryName == null ? null : categoryIds.get(locale + ":" + categoryName);

            String cover = matchThumb(home, locale, sourceId);
            if (cover == null) {
                cover = ImportHtmlUtils.firstImage(page.content());
            }

            jdbc.sql("""
                    INSERT INTO product (source_id, locale, category_id, title, summary, cover_url, content_html,
                                         seo_title, seo_description, status)
                    VALUES (:sid, :locale, :catId, :title, :summary, :cover, :html, :seoTitle, :seoDesc, 'PUBLISHED')
                    AS new
                    ON DUPLICATE KEY UPDATE
                        title = new.title, category_id = new.category_id, summary = new.summary,
                        cover_url = new.cover_url, content_html = new.content_html,
                        seo_title = new.seo_title, seo_description = new.seo_description
                    """)
                    .param("sid", sourceId).param("locale", locale).param("catId", categoryId)
                    .param("title", title).param("summary", ImportHtmlUtils.excerpt(page.content(), 150))
                    .param("cover", cover).param("html", page.content())
                    .param("seoTitle", page.title()).param("seoDesc", ImportHtmlUtils.excerpt(page.content(), 200))
                    .update();
        }
        log.info("[importer] product 导入完成");
    }

    /**
     * 产品分类（系列）：来自产品页面包屑倒数第二段（如「SURO®反渗透与纳滤膜元件」），
     * 按语言各建一组。返回 {@code (locale + ":" + 名称) -> id}。
     */
    private Map<String, Long> importProductCategories(ImportDtos.HomeBundle home, Map<String, ImportDtos.PageDto> content) {
        jdbc.sql("DELETE FROM product_category").update();

        Set<String> zhNames = new LinkedHashSet<>();
        Set<String> enNames = new LinkedHashSet<>();
        for (Map.Entry<String, ImportDtos.PageDto> entry : content.entrySet()) {
            if (KEY_PRODUCT.matcher(entry.getKey()).find()) {
                String name = ImportHtmlUtils.categoryFromCrumbs(crumbs(entry.getValue()));
                if (name != null && !name.isBlank()) {
                    zhNames.add(name);
                }
            } else if (KEY_EN_PRODUCT.matcher(entry.getKey()).find()) {
                String name = ImportHtmlUtils.categoryFromCrumbs(crumbs(entry.getValue()));
                if (name != null && !name.isBlank()) {
                    enNames.add(name);
                }
            }
        }

        Map<String, Long> ids = new HashMap<>();
        insertCategoryNames(ZH, zhNames, ids);
        insertCategoryNames(EN, enNames, ids);
        return ids;
    }

    private void insertCategoryNames(String locale, Set<String> names, Map<String, Long> ids) {
        int sort = 0;
        for (String name : names) {
            jdbc.sql("INSERT INTO product_category (locale, name, sort_order, visible) VALUES (:locale, :name, :sort, 1)")
                    .param("locale", locale).param("name", name).param("sort", sort++).update();
            Long id = jdbc.sql("SELECT id FROM product_category WHERE locale = :locale AND name = :name")
                    .param("locale", locale).param("name", name).query(Long.class).single();
            ids.put(locale + ":" + name, id);
        }
    }

    /** 首页产品瓷砖的缩略图：文件名形如 {@code product_7_1.jpg}，数字即源产品 id。 */
    private String matchThumb(ImportDtos.HomeBundle home, String locale, long sourceId) {
        ImportDtos.HomeDataDto homeData = locale.equals(ZH) ? home.zh() : home.en();
        if (homeData.portfolio() == null || homeData.portfolio().items() == null) {
            return null;
        }
        Pattern namePattern = Pattern.compile("product_" + sourceId + "_\\d+\\.(jpg|jpeg|png|gif|webp)");
        for (ImportDtos.ItemDto item : homeData.portfolio().items()) {
            if (item.thumb() != null && namePattern.matcher(fileName(item.thumb())).find()) {
                return item.thumb();
            }
        }
        return null;
    }

    private String fileName(String path) {
        int slash = path.lastIndexOf('/');
        return slash >= 0 ? path.substring(slash + 1) : path;
    }

    // ------------------------------------------------------------------
    // 工程实例
    // ------------------------------------------------------------------

    private void importProjects(Map<String, ImportDtos.PageDto> content, ImportDtos.HomeBundle home) {
        for (Map.Entry<String, ImportDtos.PageDto> entry : content.entrySet()) {
            Matcher m = KEY_PROJECT.matcher(entry.getKey());
            String locale = ZH;
            if (!m.find()) {
                m = KEY_EN_PROJECT.matcher(entry.getKey());
                if (!m.find()) {
                    continue;
                }
                locale = EN;
            }
            long sourceId = Long.parseLong(m.group(1));
            ImportDtos.PageDto page = entry.getValue();
            ImportDtos.HomeDataDto homeData = locale.equals(ZH) ? home.zh() : home.en();

            // 标题优先取首页工程卡片的标题（英文源站面包屑全部是同一句，不可靠），
            // 面包屑作中文侧的兜底
            String title = null;
            String subtitle = null;
            String cover = null;
            if (homeData.projects() != null) {
                for (ImportDtos.CardDto card : homeData.projects().cards()) {
                    if (card.href() != null && card.href().contains("id=" + sourceId)) {
                        title = card.title();
                        subtitle = card.subtitle();
                        cover = card.image();
                        break;
                    }
                }
            }
            if (title == null || title.isBlank()) {
                title = ImportHtmlUtils.titleFromCrumbs(crumbs(page));
            }
            if (title == null || title.isBlank()) {
                log.warn("[importer] 工程 {} 无法解析标题，跳过", entry.getKey());
                continue;
            }
            if (cover == null) {
                cover = ImportHtmlUtils.firstImage(page.content());
            }

            jdbc.sql("""
                    INSERT INTO project (source_id, locale, title, subtitle, cover_url, content_html,
                                         seo_title, seo_description, status)
                    VALUES (:sid, :locale, :title, :subtitle, :cover, :html, :seoTitle, :seoDesc, 'PUBLISHED')
                    AS new
                    ON DUPLICATE KEY UPDATE
                        title = new.title, subtitle = new.subtitle, cover_url = new.cover_url,
                        content_html = new.content_html, seo_title = new.seo_title,
                        seo_description = new.seo_description
                    """)
                    .param("sid", sourceId).param("locale", locale).param("title", title)
                    .param("subtitle", subtitle).param("cover", cover).param("html", page.content())
                    .param("seoTitle", page.title()).param("seoDesc", ImportHtmlUtils.excerpt(page.content(), 200))
                    .update();
        }
        log.info("[importer] project 导入完成");
    }

    // ------------------------------------------------------------------
    // 单页（about1..4 / join / handbook）
    // ------------------------------------------------------------------

    private void importPages(Map<String, ImportDtos.PageDto> content) {
        for (Map.Entry<String, ImportDtos.PageDto> entry : content.entrySet()) {
            String key = entry.getKey();
            Matcher m = Pattern.compile("^/en_(about[1-3]|join)\\.html$").matcher(key);
            String locale;
            String code;
            if (m.matches()) {
                locale = EN;
                code = m.group(1);
            } else {
                m = Pattern.compile("^/(about[1-4]|join|handbook)\\.html$").matcher(key);
                if (!m.matches()) {
                    continue;
                }
                locale = ZH;
                code = m.group(1);
            }
            ImportDtos.PageDto page = entry.getValue();

            String title = ImportHtmlUtils.titleFromCrumbs(crumbs(page));
            // join 页面包屑为空，源站 title 是站点通用名——用 code 硬映射兜底
            if (title == null || title.isBlank() || title.contains("官网") || title.toUpperCase().startsWith("AROMEM PTE")) {
                title = switch (code) {
                    case "join" -> locale.equals(ZH) ? "加入我们" : "Join us";
                    case "handbook" -> locale.equals(ZH) ? "产品手册" : "Handbook";
                    default -> title;
                };
            }
            if (title == null || title.isBlank()) {
                log.warn("[importer] 单页 {} 无法解析标题，跳过", key);
                continue;
            }
            String bannerKey = page.banner() != null
                    ? page.banner().id().replace("mu-page-header-", "")
                    : null;

            jdbc.sql("""
                    INSERT INTO page (locale, code, title, banner_key, content_html, seo_title, seo_description, status)
                    VALUES (:locale, :code, :title, :bannerKey, :html, :seoTitle, :seoDesc, 'PUBLISHED')
                    AS new
                    ON DUPLICATE KEY UPDATE
                        title = new.title, banner_key = new.banner_key, content_html = new.content_html,
                        seo_title = new.seo_title, seo_description = new.seo_description
                    """)
                    .param("locale", locale).param("code", code).param("title", title)
                    .param("bannerKey", bannerKey).param("html", page.content())
                    .param("seoTitle", page.title()).param("seoDesc", ImportHtmlUtils.excerpt(page.content(), 200))
                    .update();
        }
        log.info("[importer] page 导入完成");
    }

    // ------------------------------------------------------------------
    // 首页区块
    // ------------------------------------------------------------------

    private void importHomeBlocks(ImportDtos.HomeBundle home) {
        jdbc.sql("DELETE FROM home_slide").update();
        jdbc.sql("DELETE FROM home_section").update();
        jdbc.sql("DELETE FROM home_about_card").update();
        jdbc.sql("DELETE FROM home_video").update();

        importHomeLocale(ZH, home.zh());
        importHomeLocale(EN, home.en());
        log.info("[importer] home_* 已导入");
    }

    private void importHomeLocale(String locale, ImportDtos.HomeDataDto data) {
        if (data == null) {
            return;
        }
        // 轮播
        int sort = 0;
        for (ImportDtos.SlideDto slide : data.slider()) {
            jdbc.sql("""
                    INSERT INTO home_slide (locale, image_url, alt, sort_order, status)
                    VALUES (:locale, :src, :alt, :sort, 'PUBLISHED')
                    """)
                    .param("locale", locale).param("src", slide.src()).param("alt", slide.alt())
                    .param("sort", sort++).update();
        }
        // 区块标题；portfolio 区块的 subtitle 存筛选器 JSON（家用/工业），供 /home 聚合返回
        String filtersJson = null;
        if (data.portfolio() != null && data.portfolio().filters() != null) {
            try {
                filtersJson = objectMapper.writeValueAsString(data.portfolio().filters());
            } catch (Exception e) {
                log.warn("[importer] portfolio.filters 序列化失败：{}", e.getMessage());
            }
        }
        insertSection(locale, "portfolio", data.portfolio() == null ? null : data.portfolio().title(), filtersJson, sort);
        insertSection(locale, "news", data.news() == null ? null : data.news().title(), null, sort);
        insertSection(locale, "projects", data.projects() == null ? null : data.projects().title(), null, sort);
        insertSection(locale, "about", data.about() == null ? null : data.about().title(), null, sort);
        insertSection(locale, "video", data.video() == null ? null : data.video().heading(), null, sort);
        // 关于卡片
        if (data.about() != null) {
            int cardSort = 0;
            for (ImportDtos.AboutCardDto card : data.about().cards()) {
                jdbc.sql("""
                        INSERT INTO home_about_card (locale, image_url, title, body_html, link_url, read_more_label, sort_order)
                        VALUES (:locale, :img, :title, :body, :href, :readMore, :sort)
                        """)
                        .param("locale", locale).param("img", card.image()).param("title", card.title())
                        .param("body", card.body()).param("href", card.href()).param("readMore", card.readMore())
                        .param("sort", cardSort++).update();
            }
        }
        // 视频（源站英文版没有）
        if (data.video() != null) {
            jdbc.sql("""
                    INSERT INTO home_video (locale, heading, body_html, video_url)
                    VALUES (:locale, :heading, :body, :src)
                    """)
                    .param("locale", locale).param("heading", data.video().heading())
                    .param("body", data.video().body()).param("src", data.video().src()).update();
        }
    }

    private void insertSection(String locale, String code, String title, String subtitle, int sort) {
        jdbc.sql("""
                INSERT INTO home_section (locale, code, title, subtitle, sort_order, enabled)
                VALUES (:locale, :code, :title, :subtitle, :sort, 1)
                AS new
                ON DUPLICATE KEY UPDATE title = new.title, subtitle = new.subtitle
                """)
                .param("locale", locale).param("code", code).param("title", title)
                .param("subtitle", subtitle).param("sort", sort).update();
    }

    // ------------------------------------------------------------------
    // 工具
    // ------------------------------------------------------------------

    private void bumpRevision() {
        jdbc.sql("UPDATE site_revision SET revision = revision + 1").update();
    }

    private List<String> crumbs(ImportDtos.PageDto page) {
        if (page.breadcrumb() == null) {
            return List.of();
        }
        return page.breadcrumb().stream()
                .map(ImportDtos.CrumbDto::text)
                .toList();
    }

    /** 按 href 里的 {@code id=N} 匹配首页聚合条目。 */
    private <T> java.util.Optional<T> matchByHref(List<T> items, long sourceId) {
        String suffix = "id=" + sourceId;
        return items == null ? java.util.Optional.empty()
                : items.stream().filter(item -> {
                    String href = item instanceof ImportDtos.NewsListItemDto n ? n.href()
                            : item instanceof ImportDtos.NewsSlideDto s ? s.href() : null;
                    return href != null && href.contains(suffix);
                }).findFirst();
    }
}
