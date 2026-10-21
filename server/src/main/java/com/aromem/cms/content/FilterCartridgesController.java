package com.aromem.cms.content;

import com.aromem.cms.common.ApiResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 滤芯板块公开只读接口（型号列表 / 型号详情 / 型号对照检索）。
 *
 * <p>响应形状与前端 {@code FcProduct} / {@code FcCrossReferenceRow} 类型逐字段对齐，
 * 前端 services/cms/filterCartridges.ts 零改动切换。数据表见 V7 迁移；
 * 结构化子对象（图集/兼容型号/文档/认证/应用行业）在库里存 JSON 字符串，这里解析后输出。
 * 空库返回空清单——前端对空清单走静态兜底，页面不会开天窗。
 *
 * <p>路径说明：型号两个接口挂 /api/v1/filter-cartridges/**，
 * 型号对照按前端既有契约挂 /api/v1/cross-reference，两者不共享前缀，
 * 所以本类不设类级 @RequestMapping。
 */
@RestController
public class FilterCartridgesController {

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper;

    public FilterCartridgesController(JdbcTemplate jdbc, ObjectMapper objectMapper) {
        this.jdbc = jdbc;
        this.objectMapper = objectMapper;
    }

    // ------------------------------------------------------------------
    // DTO：字段名与前端 FcProduct / FcCrossReferenceRow 一致（camelCase）
    // ------------------------------------------------------------------
    public record CompatibleModel(String brand, String oemModel, String relation,
                                  String note, String noteZh) {
    }

    public record Document(String docType, String title, String titleZh,
                           String fileUrl, Long fileSizeBytes, String lang, String revision) {
    }

    public record ProductView(
            String model, String slug, String seriesSlug,
            String title, String titleZh, String subtitle, String subtitleZh,
            List<String> gallery,
            String overallLength, String overallLengthUnit, String overallLengthUnitZh,
            String outsideDiameter, String outsideDiameterUnit, String outsideDiameterUnitZh,
            String innerDiameter, String micronAbsolute, String micronNominal,
            List<String> mediaMaterial, String endCap, String connection,
            String flowRateMin, String flowRateMax, String flowRateUnit, String flowRateUnitZh,
            String maxTemperatureC, String maxPressureDropPsid,
            List<String> applicationIndustries,
            List<CompatibleModel> compatibleModels,
            List<Document> documents,
            List<String> certifications,
            String seoTitle, String seoTitleZh, String seoDescription, String seoDescriptionZh,
            String dataStatus,
            // 泳池类专有（V10 迁移新增），工业滤芯这几项为 null
            Double sqft, String endCapTop, String endCapBottom, String oemMachine,
            String sourceUrl,
            // 详情文案（V11 迁移）：分类短名、规格摘要、首屏简介、应用与复核说明
            String category, String categoryZh,
            String spec, String specZh,
            String summary, String summaryZh,
            String applicationNote, String applicationNoteZh,
            String technicalNote, String technicalNoteZh,
            // 原站复制的详情（V12 迁移）：子分类归属 + 富文本正文
            // 正文只在详情接口返回：单条最长 6991 字符，560 条一起吐会有几 MB。
            // Jackson 配了 non_null，列表接口传 null 时这些键不会出现在 JSON 里。
            List<String> subcats, String detailHtml, String detailHtmlZh) {
    }

    public record CrossReferenceRow(String brand, String oemModel, String relation,
                                    String note, String noteZh,
                                    String surmemModel, String seriesSlug, String productSlug) {
    }

    // ------------------------------------------------------------------
    // 接口
    // ------------------------------------------------------------------

    /** 某系列下的型号列表；series 缺省时返回全部已发布型号。 */
    @GetMapping("/api/v1/filter-cartridges/products")
    public ApiResponse<List<ProductView>> products(@RequestParam(required = false) String series) {
        List<Map<String, Object>> rows;
        if (series == null || series.isBlank()) {
            rows = jdbc.queryForList(
                    "SELECT * FROM fc_product WHERE status = 'PUBLISHED' ORDER BY series_slug, sort_order, id");
        } else {
            rows = jdbc.queryForList(
                    "SELECT * FROM fc_product WHERE status = 'PUBLISHED' AND series_slug = ? "
                            + "ORDER BY sort_order, id", series);
        }
        return ApiResponse.ok(rows.stream().map(this::toProductView).toList());
    }

    /** 型号详情；不存在返回 HTTP 404（前端按「无数据」走静态兜底）。 */
    @GetMapping("/api/v1/filter-cartridges/products/{slug}")
    public org.springframework.http.ResponseEntity<ApiResponse<ProductView>> product(
            @PathVariable String slug, @RequestParam(required = false) String series) {
        List<Map<String, Object>> rows;
        if (series == null || series.isBlank()) {
            rows = jdbc.queryForList(
                    "SELECT * FROM fc_product WHERE status = 'PUBLISHED' AND slug = ? LIMIT 1", slug);
        } else {
            rows = jdbc.queryForList(
                    "SELECT * FROM fc_product WHERE status = 'PUBLISHED' AND slug = ? AND series_slug = ? "
                            + "LIMIT 1", slug, series);
        }
        if (rows.isEmpty()) {
            com.aromem.cms.common.ErrorCode notFound = com.aromem.cms.common.ErrorCode.NOT_FOUND;
            return org.springframework.http.ResponseEntity.status(notFound.getHttpStatus())
                    .body(ApiResponse.fail(notFound));
        }
        return org.springframework.http.ResponseEntity.ok(ApiResponse.ok(toProductView(rows.get(0), true)));
    }

    /**
     * 型号对照检索：q 规范化（去空格与连字符、转小写）后对
     * oem_model / surmem_model 做包含匹配，brand 可精确过滤——
     * 与前端本地静态检索 searchCrossReference 的口径一致。
     */
    @GetMapping("/api/v1/cross-reference")
    public ApiResponse<List<CrossReferenceRow>> crossReference(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String series) {
        String needle = q == null ? "" : q.trim().toLowerCase().replaceAll("[\\s\\-]", "");
        StringBuilder where = new StringBuilder(" WHERE status = 'PUBLISHED'");
        List<Object> args = new ArrayList<>();
        if (brand != null && !brand.isBlank()) {
            where.append(" AND brand = ?");
            args.add(brand);
        }
        if (series != null && !series.isBlank()) {
            where.append(" AND series_slug = ?");
            args.add(series);
        }
        if (!needle.isEmpty()) {
            where.append(" AND (LOWER(REPLACE(REPLACE(oem_model, ' ', ''), '-', '')) LIKE ? "
                    + "OR LOWER(REPLACE(REPLACE(surmem_model, ' ', ''), '-', '')) LIKE ?)");
            args.add("%" + needle + "%");
            args.add("%" + needle + "%");
        }
        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT * FROM fc_cross_reference" + where + " ORDER BY brand, oem_model, id",
                args.toArray());
        return ApiResponse.ok(rows.stream().map(r -> new CrossReferenceRow(
                str(r.get("brand")), str(r.get("oem_model")), str(r.get("relation")),
                str(r.get("note")), str(r.get("note_zh")),
                str(r.get("surmem_model")), str(r.get("series_slug")),
                str(r.get("product_slug")))).toList());
    }

    // ------------------------------------------------------------------
    // 行 → DTO（JSON 列解析；解析失败按空清单处理，不让一条脏数据拖垮整个接口）
    // ------------------------------------------------------------------

    private ProductView toProductView(Map<String, Object> r) {
        return toProductView(r, false);
    }

    /**
     * 行 → DTO。
     *
     * @param withDetail 是否带上详情正文。列表接口一律 false——560 条型号里
     *                   每条正文动辄几千字符，全量输出会让响应膨胀到几 MB，
     *                   而后台列表和前台列表都不需要正文，只有详情页要。
     */
    private ProductView toProductView(Map<String, Object> r, boolean withDetail) {
        return new ProductView(
                str(r.get("model")), str(r.get("slug")), str(r.get("series_slug")),
                str(r.get("title")), str(r.get("title_zh")),
                str(r.get("subtitle")), str(r.get("subtitle_zh")),
                stringList(r.get("gallery_json")),
                str(r.get("overall_length")), str(r.get("overall_length_unit")),
                str(r.get("overall_length_unit_zh")),
                str(r.get("outside_diameter")), str(r.get("outside_diameter_unit")),
                str(r.get("outside_diameter_unit_zh")),
                str(r.get("inner_diameter")), str(r.get("micron_absolute")), str(r.get("micron_nominal")),
                stringList(r.get("media_material_json")), str(r.get("end_cap")), str(r.get("connection")),
                str(r.get("flow_rate_min")), str(r.get("flow_rate_max")),
                str(r.get("flow_rate_unit")), str(r.get("flow_rate_unit_zh")),
                str(r.get("max_temperature_c")), str(r.get("max_pressure_drop_psid")),
                stringList(r.get("application_industries_json")),
                compatibleModels(r.get("compatible_models_json")),
                documents(r.get("documents_json")),
                stringList(r.get("certifications_json")),
                str(r.get("seo_title")), str(r.get("seo_title_zh")),
                str(r.get("seo_description")), str(r.get("seo_description_zh")),
                str(r.get("data_status")),
                num(r.get("sqft")), str(r.get("end_cap_top")), str(r.get("end_cap_bottom")),
                str(r.get("oem_machine")), str(r.get("source_url")),
                str(r.get("category_en")), str(r.get("category_zh")),
                str(r.get("spec_en")), str(r.get("spec_zh")),
                str(r.get("summary_en")), str(r.get("summary_zh")),
                str(r.get("application_note_en")), str(r.get("application_note_zh")),
                str(r.get("technical_note_en")), str(r.get("technical_note_zh")),
                stringList(r.get("subcats_json")),
                withDetail ? str(r.get("detail_html_en")) : null,
                withDetail ? str(r.get("detail_html_zh")) : null);
    }

    private List<String> stringList(Object json) {
        JsonNode node = readTree(json);
        if (node == null || !node.isArray()) {
            return List.of();
        }
        List<String> out = new ArrayList<>();
        node.forEach(n -> out.add(n.asText("")));
        return out;
    }

    private List<CompatibleModel> compatibleModels(Object json) {
        JsonNode node = readTree(json);
        if (node == null || !node.isArray()) {
            return List.of();
        }
        List<CompatibleModel> out = new ArrayList<>();
        node.forEach(n -> out.add(new CompatibleModel(
                n.path("brand").asText(""), n.path("oemModel").asText(""),
                n.path("relation").asText("compatible"),
                n.path("note").asText(""), n.path("noteZh").asText(""))));
        return out;
    }

    private List<Document> documents(Object json) {
        JsonNode node = readTree(json);
        if (node == null || !node.isArray()) {
            return List.of();
        }
        List<Document> out = new ArrayList<>();
        node.forEach(n -> out.add(new Document(
                n.path("docType").asText("datasheet"), n.path("title").asText(""),
                n.path("titleZh").asText(""),
                n.hasNonNull("fileUrl") ? n.get("fileUrl").asText() : null,
                n.hasNonNull("fileSizeBytes") && n.get("fileSizeBytes").isNumber()
                        ? n.get("fileSizeBytes").asLong() : null,
                n.path("lang").asText(""), n.path("revision").asText(""))));
        return out;
    }

    private JsonNode readTree(Object json) {
        if (json == null || String.valueOf(json).isBlank()) {
            return null;
        }
        try {
            return objectMapper.readTree(String.valueOf(json));
        } catch (Exception ex) {
            return null;
        }
    }

    private static String str(Object v) {
        return v == null ? "" : String.valueOf(v);
    }

    /** DECIMAL 列取出来是 BigDecimal，转 Double 给前端直接当数字用；空值保持 null */
    private static Double num(Object v) {
        if (v == null) {
            return null;
        }
        if (v instanceof Number n) {
            return n.doubleValue();
        }
        try {
            return Double.parseDouble(String.valueOf(v));
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
