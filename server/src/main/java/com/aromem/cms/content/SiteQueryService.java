package com.aromem.cms.content;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 公开只读接口的查询服务（P2）。
 *
 * <p>直接走 {@link JdbcClient} 而不是 JPA 实体：这些接口全部是只读、
 * 聚合形状各异（首页聚合、面包屑拼接、分类树），用 SQL + record 投影最直接；
 * 管理端 CRUD（P4）再按需引入实体。
 */
@Service
public class SiteQueryService {

    static final String ZH = "zh-CN";
    static final String EN = "en-US";
    static final List<String> LOCALES = List.of(ZH, EN);

    private final JdbcClient jdbc;
    private final ObjectMapper objectMapper;

    SiteQueryService(JdbcClient jdbc, ObjectMapper objectMapper) {
        this.jdbc = jdbc;
        this.objectMapper = objectMapper;
    }

    /** ?locale= → 白名单校验；缺省用 Accept-Language 的语言段；再缺省 zh-CN。 */
    String resolveLocale(String param, String acceptLanguage) {
        if (StringUtils.hasText(param)) {
            String p = param.trim();
            if (p.equalsIgnoreCase("zh") || p.equalsIgnoreCase("zh-CN")) {
                return ZH;
            }
            if (p.equalsIgnoreCase("en") || p.equalsIgnoreCase("en-US")) {
                return EN;
            }
            throw new IllegalArgumentException("不支持的语言: " + param);
        }
        if (StringUtils.hasText(acceptLanguage) && acceptLanguage.toLowerCase().startsWith("en")) {
            return EN;
        }
        return ZH;
    }

    public long revision() {
        return jdbc.sql("SELECT revision FROM site_revision ORDER BY id LIMIT 1")
                .query(Long.class).single();
    }

    // ------------------------------------------------------------------
    // 站点外壳
    // ------------------------------------------------------------------

    public PublicDtos.BootstrapView bootstrap(String locale) {
        return new PublicDtos.BootstrapView(
                locale,
                revision(),
                navTree(locale),
                footer(locale),
                banners());
    }

    public List<PublicDtos.NavNode> navTree(String locale) {
        record Row(Long id, Long parentId, String label, String targetValue) {
        }
        List<Row> rows = jdbc.sql("""
                        SELECT id, parent_id AS parentId, label, target_value AS targetValue
                        FROM nav_menu WHERE locale = :locale AND visible = 1
                        ORDER BY parent_id IS NULL DESC, sort_order, id
                        """)
                .param("locale", locale)
                .query(Row.class).list();

        Map<Long, List<Row>> byParent = new LinkedHashMap<>();
        for (Row r : rows) {
            byParent.computeIfAbsent(r.parentId(), k -> new ArrayList<>()).add(r);
        }
        List<PublicDtos.NavNode> tree = new ArrayList<>();
        for (Row top : byParent.getOrDefault(null, List.of())) {
            List<PublicDtos.NavNode> children = byParent.getOrDefault(top.id(), List.of()).stream()
                    .map(c -> new PublicDtos.NavNode(c.label(), c.targetValue(), List.of()))
                    .toList();
            tree.add(new PublicDtos.NavNode(top.label(), top.targetValue(), children.isEmpty() ? null : children));
        }
        return tree;
    }

    public PublicDtos.FooterView footer(String locale) {
        record ColumnRow(Long id, String title) {
        }
        List<ColumnRow> columns = jdbc.sql("""
                        SELECT id, title FROM footer_column WHERE locale = :locale ORDER BY sort_order, id
                        """)
                .param("locale", locale).query(ColumnRow.class).list();

        record LinkRow(Long columnId, String label, String targetValue) {
        }
        List<LinkRow> links = jdbc.sql("""
                        SELECT column_id AS columnId, label, target_value AS targetValue
                        FROM footer_link WHERE locale = :locale ORDER BY column_id, sort_order, id
                        """)
                .param("locale", locale).query(LinkRow.class).list();

        Map<Long, List<LinkRow>> byColumn = new LinkedHashMap<>();
        for (LinkRow l : links) {
            byColumn.computeIfAbsent(l.columnId(), k -> new ArrayList<>()).add(l);
        }
        List<PublicDtos.FooterView.FooterColumn> cols = columns.stream()
                .map(c -> new PublicDtos.FooterView.FooterColumn(c.title(),
                        byColumn.getOrDefault(c.id(), List.of()).stream()
                                .map(l -> new PublicDtos.FooterView.LinkItem(l.label(), l.targetValue()))
                                .toList()))
                .toList();

        Map<String, String> settings = settings(locale);
        PublicDtos.FooterView.ContactInfo contact = new PublicDtos.FooterView.ContactInfo(
                settings.get("contact_title"),
                settings.get("address"),
                settings.get("phone"),
                settings.get("qr"),
                settings.containsKey("emails") ? Arrays.stream(settings.get("emails").split(",")).toList() : null);
        PublicDtos.FooterView.IcpInfo icp = settings.containsKey("icp_label")
                ? new PublicDtos.FooterView.IcpInfo(settings.get("icp_label"), settings.get("icp_url"))
                : null;

        return new PublicDtos.FooterView(
                cols.size() > 0 ? cols.get(0) : null,
                cols.size() > 1 ? cols.get(1) : null,
                cols.size() > 2 ? cols.get(2) : null,
                contact,
                settings.get("copyright"),
                icp);
    }

    private Map<String, String> settings(String locale) {
        Map<String, String> map = new HashMap<>();
        jdbc.sql("SELECT setting_key, setting_value FROM site_setting WHERE locale = :locale")
                .param("locale", locale)
                .query((rs, i) -> Map.entry(rs.getString(1), rs.getString(2)))
                .list()
                .forEach(e -> map.put(e.getKey(), e.getValue()));
        return map;
    }

    public Map<String, String> banners() {
        Map<String, String> map = new LinkedHashMap<>();
        jdbc.sql("SELECT banner_key, html FROM page_banner")
                .query((rs, i) -> Map.entry(rs.getString(1), rs.getString(2)))
                .list()
                .forEach(e -> map.put(e.getKey(), e.getValue()));
        return map;
    }

    // ------------------------------------------------------------------
    // 首页聚合（对齐前端 HomeData）
    // ------------------------------------------------------------------

    public PublicDtos.HomeView home(String locale) {
        String lang = locale.equals(ZH) ? "zh" : "en";

        // 复用分区块查询：/home 聚合 = 五个区块端点的拼装（保持兼容）
        Map<String, String> sections = homeSections(locale);
        List<PublicDtos.HomeView.SlideView> slides = homeSlides(locale);
        PublicDtos.ProductTilesView tiles = homeProducts(locale, null, null);
        record VideoRow(String heading, String bodyHtml, String videoUrl) {
        }
        Optional<VideoRow> video = jdbc.sql("""
                        SELECT heading, body_html AS bodyHtml, video_url AS videoUrl
                        FROM home_video WHERE locale = :locale
                        """)
                .param("locale", locale).query(VideoRow.class).optional();

        PublicDtos.HomeView.NewsView news = homeNews(locale);
        PublicDtos.HomeView.CardsView projects = homeProjectCards(locale);

        PublicDtos.AboutCardsView about = homeAboutCards(locale);

        return new PublicDtos.HomeView(
                lang, slides,
                new PublicDtos.HomeView.PortfolioView(
                        tiles.title(), tiles.filters(), tiles.items()),
                video.map(v -> new PublicDtos.HomeView.VideoView(v.heading(), v.bodyHtml(), v.videoUrl())).orElse(null),
                news,
                projects,
                new PublicDtos.HomeView.CardsView(about.title(), about.cards().stream()
                        .map(c -> new PublicDtos.HomeView.CardsView.Card(
                                c.href(), c.title(), c.body(), c.image()))
                        .toList()));
    }

    // ------------------------------------------------------------------
    // 首页分区块查询（每个区块一个公开端点，语义化、可独立缓存）
    // ------------------------------------------------------------------

    /** home_section 键值（各区块标题等文案）。 */
    private Map<String, String> homeSections(String locale) {
        Map<String, String> sections = new HashMap<>();
        jdbc.sql("SELECT code, title, subtitle FROM home_section WHERE locale = :locale AND enabled = 1")
                .param("locale", locale)
                .query((rs, i) -> Map.entry(rs.getString(1), new String[]{rs.getString(2), rs.getString(3)}))
                .list()
                .forEach(e -> {
                    sections.put(e.getKey() + ":title", e.getValue()[0]);
                    sections.put(e.getKey() + ":subtitle", e.getValue()[1]);
                });
        return sections;
    }

    /** 轮播图：一次返回全部（含每张图的地址与跳转）。 */
    public List<PublicDtos.HomeView.SlideView> homeSlides(String locale) {
        return jdbc.sql("""
                        SELECT image_url AS src, alt, link_url AS linkUrl
                        FROM home_slide WHERE locale = :locale AND status = 'PUBLISHED'
                        ORDER BY sort_order, id
                        """)
                .param("locale", locale)
                .query(PublicDtos.HomeView.SlideView.class).list();
    }

    /** 首页「产品中心」瓷砖：series("1"家用/"2"工业) 可选；categoryId 预留真分类筛选。 */
    public PublicDtos.ProductTilesView homeProducts(String locale, String series, Long categoryId) {
        Map<String, String> sections = homeSections(locale);
        List<PublicDtos.HomeView.PortfolioView.FilterView> filters = List.of();
        try {
            String subtitle = sections.get("portfolio:subtitle");
            if (StringUtils.hasText(subtitle)) {
                filters = objectMapper.readValue(subtitle, new TypeReference<>() {
                });
            }
        } catch (Exception ignored) {
            // subtitle 不是合法 JSON 时退回空列表，前端自己兜底
        }

        // 瓷砖来自 home_tile（V8，后台可维护）：series 参数即分区 board（cartridges / ro / accessories）。
        // 旧 product 表 + 标题匹配的链路已退役。
        boolean filterByBoard = series != null && !series.isBlank() && !"all".equals(series);
        record TileRow(String board, String nameZh, String nameEn, String imageUrl, String linkUrl) {
        }
        var spec = jdbc.sql("""
                SELECT board, name_zh AS nameZh, name_en AS nameEn,
                       image_url AS imageUrl, link_url AS linkUrl
                FROM home_tile WHERE status = 'PUBLISHED'
                """ + (filterByBoard ? " AND board = :board" : "") + " ORDER BY sort_order, id");
        if (filterByBoard) {
            spec = spec.param("board", series);
        }
        List<TileRow> rows = spec.query(TileRow.class).list();
        boolean zh = "zh-CN".equals(locale);
        List<PublicDtos.HomeView.PortfolioView.ItemView> items = rows.stream()
                .map(r -> {
                    String name = zh ? r.nameZh() : r.nameEn();
                    String image = r.imageUrl();
                    return new PublicDtos.HomeView.PortfolioView.ItemView(
                            r.board(), image, name, image, name, r.linkUrl());
                })
                .toList();
        return new PublicDtos.ProductTilesView(sections.get("portfolio:title"), filters, items);
    }

    /** 空值安全转字符串。 */
    private static String str(Object v) {
        return v == null ? "" : String.valueOf(v);
    }

    /** 首页「新闻资讯」区块：置顶优先 5 条滑窗 + 3 条列表 + 更多按钮。 */
    public PublicDtos.HomeView.NewsView homeNews(String locale) {
        Map<String, String> sections = homeSections(locale);
        record NewsRow(long sourceId, String title, String summary, String coverUrl) {
        }
        List<NewsRow> latestNews = jdbc.sql("""
                        SELECT source_id AS sourceId, title, summary, cover_url AS coverUrl
                        FROM article WHERE locale = :locale AND status = 'PUBLISHED'
                        ORDER BY is_top DESC, source_id DESC LIMIT 5
                        """)
                .param("locale", locale).query(NewsRow.class).list();
        String newsBase = locale.equals(ZH) ? "/news_detail?id=" : "/en/news_detail?id=";
        List<PublicDtos.HomeView.NewsView.SlideItem> slides = latestNews.stream()
                .map(n -> new PublicDtos.HomeView.NewsView.SlideItem(
                        newsBase + n.sourceId(), n.coverUrl(), n.title())).toList();
        List<PublicDtos.HomeView.NewsView.ListItem> listItems = latestNews.stream().limit(3)
                .map(n -> new PublicDtos.HomeView.NewsView.ListItem(
                        newsBase + n.sourceId(), n.title(), n.summary())).toList();
        return new PublicDtos.HomeView.NewsView(
                sections.get("news:title"), slides, listItems,
                new PublicDtos.HomeView.NewsView.Button(
                        locale.equals(ZH) ? "/news_list" : "/en/news_list",
                        locale.equals(ZH) ? "更多新闻详情" : "MORE NEWS"));
    }

    /** 首页「工程实例」卡片。 */
    public PublicDtos.HomeView.CardsView homeProjectCards(String locale) {
        Map<String, String> sections = homeSections(locale);
        String projectBase = locale.equals(ZH) ? "/projects?id=" : "/en/projects?id=";
        List<PublicDtos.HomeView.CardsView.Card> cards = jdbc.sql("""
                        SELECT source_id AS sourceId, title, subtitle, cover_url AS coverUrl
                        FROM project WHERE locale = :locale AND status = 'PUBLISHED'
                        ORDER BY sort_order, source_id
                        """)
                .param("locale", locale)
                .query((rs, i) -> new PublicDtos.HomeView.CardsView.Card(
                        projectBase + rs.getLong("sourceId"), rs.getString("title"),
                        rs.getString("subtitle"), rs.getString("coverUrl")))
                .list();
        return new PublicDtos.HomeView.CardsView(sections.get("projects:title"), cards);
    }

    /** 首页「关于我们」卡片（字段名直接对齐前端 AboutCard）。 */
    public PublicDtos.AboutCardsView homeAboutCards(String locale) {
        Map<String, String> sections = homeSections(locale);
        List<PublicDtos.AboutCardsView.AboutCard> cards = jdbc.sql("""
                        SELECT image_url AS image, title, body_html AS body,
                               link_url AS href, read_more_label AS readMore
                        FROM home_about_card WHERE locale = :locale
                        ORDER BY sort_order, id
                        """)
                .param("locale", locale)
                .query((rs, i) -> new PublicDtos.AboutCardsView.AboutCard(
                        rs.getString("image"), rs.getString("title"),
                        rs.getString("body"), rs.getString("href"), rs.getString("readMore")))
                .list();
        return new PublicDtos.AboutCardsView(sections.get("about:title"), cards);
    }

    // ------------------------------------------------------------------
    // 新闻
    // ------------------------------------------------------------------

    public PublicDtos.ArticlePageView articles(String locale, int page, int size) {
        long total = jdbc.sql("SELECT COUNT(*) FROM article WHERE locale = :locale AND status = 'PUBLISHED'")
                .param("locale", locale).query(Long.class).single();
        int totalPages = (int) ((total + size - 1) / size);
        int safePage = Math.max(1, Math.min(page, Math.max(totalPages, 1)));

        record Row(long sourceId, String title, String summary, String coverUrl, boolean isTop) {
        }
        List<PublicDtos.ArticleListItem> items = jdbc.sql("""
                        SELECT source_id AS sourceId, title, summary, cover_url AS coverUrl, is_top AS isTop
                        FROM article WHERE locale = :locale AND status = 'PUBLISHED'
                        ORDER BY is_top DESC, source_id DESC
                        LIMIT :limit OFFSET :offset
                        """)
                .param("locale", locale).param("limit", size).param("offset", (safePage - 1) * size)
                .query(Row.class).list()
                .stream()
                .map(r -> new PublicDtos.ArticleListItem(
                        r.sourceId(), r.title(), r.summary(), r.coverUrl(), r.isTop(),
                        (locale.equals(ZH) ? "/news_detail?id=" : "/en/news_detail?id=") + r.sourceId()))
                .toList();

        return new PublicDtos.ArticlePageView(safePage, size, total, totalPages, items);
    }

    public Optional<PublicDtos.ArticleDetailView> article(String locale, long sourceId) {
        record Row(String title, String publishedAt, String contentHtml) {
        }
        Optional<Row> row = jdbc.sql("""
                        SELECT title, published_at AS publishedAt, content_html AS contentHtml
                        FROM article WHERE locale = :locale AND source_id = :sid AND status IN ('PUBLISHED', 'OFFLINE')
                        """)
                .param("locale", locale).param("sid", sourceId).query(Row.class).optional();

        return row.map(r -> new PublicDtos.ArticleDetailView(
                sourceId, locale, r.title(), r.publishedAt(), r.contentHtml(),
                List.of(Map.of("text", locale.equals(ZH) ? "首页" : "HOME", "href", "/"),
                        Map.of("text", locale.equals(ZH) ? "新闻资讯" : "News",
                                "href", locale.equals(ZH) ? "/news_list" : "/en/news_list"),
                        Map.of("text", r.title() == null ? "" : r.title(), "href", "NULL"))));
    }

    // ------------------------------------------------------------------
    // 产品
    // ------------------------------------------------------------------

    public List<PublicDtos.CategoryNode> productCategories(String locale) {
        record Row(long id, Long parentId, String name) {
        }
        List<Row> rows = jdbc.sql("""
                        SELECT id, parent_id AS parentId, name FROM product_category
                        WHERE locale = :locale AND visible = 1 ORDER BY sort_order, id
                        """)
                .param("locale", locale).query(Row.class).list();
        // 当前数据只有一级系列分类；结构上支持 parent_id 扩两级
        return rows.stream()
                .filter(r -> r.parentId() == null)
                .map(r -> new PublicDtos.CategoryNode(r.id(), r.name(),
                        rows.stream()
                                .filter(c -> c.parentId() != null && r.id() == c.parentId())
                                .map(c -> new PublicDtos.CategoryNode(c.id(), c.name(), List.of()))
                                .toList()))
                .toList();
    }

    public Optional<PublicDtos.ProductDetailView> product(String locale, long sourceId) {
        record Row(String title, String coverUrl, String contentHtml, Long categoryId) {
        }
        Optional<Row> row = jdbc.sql("""
                        SELECT title, cover_url AS coverUrl, content_html AS contentHtml, category_id AS categoryId
                        FROM product WHERE locale = :locale AND source_id = :sid AND status IN ('PUBLISHED', 'OFFLINE')
                        """)
                .param("locale", locale).param("sid", sourceId).query(Row.class).optional();
        if (row.isEmpty()) {
            return Optional.empty();
        }
        Row r = row.get();

        List<PublicDtos.CategoryNode> tree = productCategories(locale);
        PublicDtos.CategoryNode category = tree.stream()
                .filter(c -> r.categoryId() != null && c.id() == r.categoryId())
                .findFirst().orElse(null);

        List<PublicDtos.ProductDetailView.RelatedProduct> related = r.categoryId() == null ? List.of()
                : jdbc.sql("""
                        SELECT source_id AS sourceId, title, cover_url AS coverUrl
                        FROM product WHERE locale = :locale AND status = 'PUBLISHED' AND category_id = :cid
                          AND source_id <> :sid
                        ORDER BY sort_order, source_id
                        """)
                        .param("locale", locale).param("cid", r.categoryId()).param("sid", sourceId)
                        .query((rs, i) -> new PublicDtos.ProductDetailView.RelatedProduct(
                                rs.getLong("sourceId"), rs.getString("title"), rs.getString("coverUrl"),
                                (locale.equals(ZH) ? "/products?id=" : "/en/products?id=") + rs.getLong("sourceId")))
                        .list();

        return Optional.of(new PublicDtos.ProductDetailView(
                sourceId, locale, r.title(), r.coverUrl(), r.contentHtml(), category, tree, related));
    }

    // ------------------------------------------------------------------
    // 工程 / 单页 / 下载 / 站点地图
    // ------------------------------------------------------------------

    public Optional<PublicDtos.ProjectDetailView> project(String locale, long sourceId) {
        record Row(String title, String subtitle, String coverUrl, String contentHtml) {
        }
        return jdbc.sql("""
                        SELECT title, subtitle, cover_url AS coverUrl, content_html AS contentHtml
                        FROM project WHERE locale = :locale AND source_id = :sid AND status IN ('PUBLISHED', 'OFFLINE')
                        """)
                .param("locale", locale).param("sid", sourceId).query(Row.class).optional()
                .map(r -> new PublicDtos.ProjectDetailView(
                        sourceId, locale, r.title(), r.subtitle(), r.coverUrl(), r.contentHtml()));
    }

    public Optional<PublicDtos.PageDetailView> page(String locale, String code) {
        record Row(String title, String bannerKey, String contentHtml) {
        }
        return jdbc.sql("""
                        SELECT title, banner_key AS bannerKey, content_html AS contentHtml
                        FROM page WHERE locale = :locale AND code = :code AND status IN ('PUBLISHED', 'OFFLINE')
                        """)
                .param("locale", locale).param("code", code).query(Row.class).optional()
                .map(r -> new PublicDtos.PageDetailView(code, locale, r.title(), r.bannerKey(), r.contentHtml()));
    }

    public List<PublicDtos.DownloadItem> downloads(String locale) {
        return jdbc.sql("""
                        SELECT id, title, category, file_url AS fileUrl, file_size_bytes AS fileSizeBytes
                        FROM download WHERE locale = :locale AND status = 'PUBLISHED' ORDER BY sort_order, id
                        """)
                .param("locale", locale)
                .query(PublicDtos.DownloadItem.class).list();
    }

    /** 板块①滤芯系列清单（双语全量返回；facets 按 | 拆分；语言由前台自取）。 */
    public List<PublicDtos.SeriesItem> fcSeries(String locale) {
        record SeriesRow(long id, String slug, String nameZh, String nameEn,
                         String taglineZh, String taglineEn,
                         String facetsZh, String facetsEn, boolean comingSoon,
                         String checklistZh, String checklistEn,
                         String verificationZh, String verificationEn,
                         String subcatsJson) {
        }
        List<SeriesRow> rows = jdbc.sql("""
                        SELECT id, slug, name_zh AS nameZh, name_en AS nameEn,
                               tagline_zh AS taglineZh, tagline_en AS taglineEn,
                               facets_zh AS facetsZh, facets_en AS facetsEn, coming_soon AS comingSoon,
                               checklist_zh AS checklistZh, checklist_en AS checklistEn,
                               verification_zh AS verificationZh, verification_en AS verificationEn,
                               subcats_json AS subcatsJson
                        FROM fc_series WHERE status = 'PUBLISHED' ORDER BY sort_order, id
                        """)
                .query(SeriesRow.class).list();
        return rows.stream().map(r -> new PublicDtos.SeriesItem(
                r.id(), r.slug(), r.nameZh(), r.nameEn(), r.taglineZh(), r.taglineEn(),
                toFacets(r.facetsZh()), toFacets(r.facetsEn()), r.comingSoon(),
                toFacets(r.checklistZh()), toFacets(r.checklistEn()),
                r.verificationZh(), r.verificationEn(),
                toSubcats(r.subcatsJson()))).toList();
    }

    /** 子分类字典 JSON → 清单；脏数据或未配置时返回空清单，不影响系列本身可用。 */
    private List<PublicDtos.SubcatItem> toSubcats(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json,
                    objectMapper.getTypeFactory().constructCollectionType(List.class,
                            PublicDtos.SubcatItem.class));
        } catch (Exception e) {
            return List.of();
        }
    }

    /** "a|b|c" → List；空串/空白返回空清单。 */
    private static List<String> toFacets(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        return java.util.Arrays.stream(raw.split("\\|"))
                .map(String::trim).filter(s -> !s.isEmpty()).toList();
    }

    public PublicDtos.SitemapView sitemap() {
        record EntryRow(String locale, long sourceId, String title, String updatedAt) {
        }
        record PageRow(String locale, String code, String title, String updatedAt) {
        }
        List<PublicDtos.SitemapView.SitemapEntry> articles = jdbc.sql("""
                        SELECT locale, source_id AS sourceId, title,
                               DATE_FORMAT(updated_at, '%Y-%m-%dT%H:%i:%s') AS updatedAt
                        FROM article WHERE status = 'PUBLISHED' ORDER BY locale, source_id
                        """).query(EntryRow.class).list()
                .stream().map(r -> new PublicDtos.SitemapView.SitemapEntry(r.locale(), r.sourceId(), r.title(), r.updatedAt())).toList();
        List<PublicDtos.SitemapView.SitemapEntry> products = jdbc.sql("""
                        SELECT locale, source_id AS sourceId, title,
                               DATE_FORMAT(updated_at, '%Y-%m-%dT%H:%i:%s') AS updatedAt
                        FROM product WHERE status = 'PUBLISHED' ORDER BY locale, source_id
                        """).query(EntryRow.class).list()
                .stream().map(r -> new PublicDtos.SitemapView.SitemapEntry(r.locale(), r.sourceId(), r.title(), r.updatedAt())).toList();
        List<PublicDtos.SitemapView.SitemapEntry> projects = jdbc.sql("""
                        SELECT locale, source_id AS sourceId, title,
                               DATE_FORMAT(updated_at, '%Y-%m-%dT%H:%i:%s') AS updatedAt
                        FROM project WHERE status = 'PUBLISHED' ORDER BY locale, source_id
                        """).query(EntryRow.class).list()
                .stream().map(r -> new PublicDtos.SitemapView.SitemapEntry(r.locale(), r.sourceId(), r.title(), r.updatedAt())).toList();
        List<PublicDtos.SitemapView.SitemapPage> pages = jdbc.sql("""
                        SELECT locale, code, title, DATE_FORMAT(updated_at, '%Y-%m-%dT%H:%i:%s') AS updatedAt
                        FROM page WHERE status = 'PUBLISHED' ORDER BY locale, code
                        """).query(PageRow.class).list()
                .stream().map(r -> new PublicDtos.SitemapView.SitemapPage(r.locale(), r.code(), r.title(), r.updatedAt())).toList();

        return new PublicDtos.SitemapView(revision(), articles, products, projects, pages);
    }
}
