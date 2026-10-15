package com.aromem.cms.importer;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/**
 * 导入数据源的形状（与 {@code resources/import/*.json} 一一对应）。
 *
 * <p>这些 JSON 由爬取产物转换而来：
 * <ul>
 *   <li>{@code content.json} — 100 个页面的整页数据（url/title/banner/breadcrumb/content）</li>
 *   <li>{@code home.json} — 首页聚合（由 {@code cloner/src/data/home.ts} 导出）</li>
 *   <li>{@code nav.json} — 导航与页脚（由 {@code cloner/src/data/nav.ts} 导出）</li>
 * </ul>
 */
final class ImportDtos {

    private ImportDtos() {
    }

    // ------------------------------------------------------------------
    // content.json
    // ------------------------------------------------------------------

    @JsonIgnoreProperties(ignoreUnknown = true)
    record BannerDto(String id, String html) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record CrumbDto(String text, String href) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record PageDto(String url, String title, BannerDto banner, List<CrumbDto> breadcrumb, String content) {
    }

    // ------------------------------------------------------------------
    // home.json（对应前端 HomeData 类型）
    // ------------------------------------------------------------------

    @JsonIgnoreProperties(ignoreUnknown = true)
    record HomeBundle(HomeDataDto zh, HomeDataDto en) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record HomeDataDto(String lang, List<SlideDto> slider, PortfolioDto portfolio,
                       VideoDto video, NewsDto news, ProjectsDto projects, AboutDto about) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record SlideDto(String src, String alt) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record PortfolioDto(String title, List<FilterDto> filters, List<ItemDto> items) {
    }

    /** filter：{@code "1"} = 家用产品系列，{@code "2"} = 工业产品系列。 */
    @JsonIgnoreProperties(ignoreUnknown = true)
    record FilterDto(String filter, String label) {
    }

    /** 源站首页产品瓷砖；{@code full}/{@code thumb} 文件名形如 {@code product_7_1.jpg}，数字即源产品 id。 */
    @JsonIgnoreProperties(ignoreUnknown = true)
    record ItemDto(String category, String full, String title, String thumb, String alt) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record VideoDto(String heading, String body, String src) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record NewsDto(String title, List<NewsSlideDto> slides, List<NewsListItemDto> list, ButtonDto button) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record NewsSlideDto(String href, String image, String caption) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record NewsListItemDto(String href, String title, String excerpt) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record ButtonDto(String href, String label) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record ProjectsDto(String title, List<CardDto> cards) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record CardDto(String href, String title, String subtitle, String image) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record AboutDto(String title, List<AboutCardDto> cards) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record AboutCardDto(String image, String title, String body, String href, String readMore) {
    }

    // ------------------------------------------------------------------
    // nav.json（对应前端 NavItem / footer 数据）
    // ------------------------------------------------------------------

    @JsonIgnoreProperties(ignoreUnknown = true)
    record NavBundle(NavPart nav, FooterPart footer) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record NavPart(List<NavItemDto> zh, List<NavItemDto> en) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record NavItemDto(String label, String href, List<NavItemDto> children) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record FooterPart(FooterDto zh, FooterDto en) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record FooterDto(ColDto col1, ColDto col2, ColDto col3, ContactDto contact,
                     String copyright, IcpDto icp) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record ColDto(String title, List<LinkDto> links) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record LinkDto(String label, String href) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record ContactDto(String title, String address, String phone, String qr, List<String> emails) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record IcpDto(String label, String href) {
    }
}
