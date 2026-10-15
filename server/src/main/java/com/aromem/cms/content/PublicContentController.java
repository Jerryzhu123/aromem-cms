package com.aromem.cms.content;

import com.aromem.cms.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 公开只读内容接口（P2，前缀 /api/v1）。
 *
 * <p>语言约定：{@code ?locale=zh-CN|en-US}（简写 zh / en 亦可），
 * 缺省按 {@code Accept-Language}，再缺省 zh-CN。
 * 所有响应走统一体 {@code {code, msg, data}}，HTTP 状态码同义（404 = 内容不存在）。
 */
@RestController
@RequestMapping("/api/v1")
public class PublicContentController {

    private final SiteQueryService query;

    PublicContentController(SiteQueryService query) {
        this.query = query;
    }

    // ------------------------------------------------------------------
    // 站点外壳 + 首页
    // ------------------------------------------------------------------

    /** 导航树 + 页脚 + 联系方式 + banner 表 + 内容版本号（前端布局层一次取全）。 */
    @GetMapping("/site/bootstrap")
    public ApiResponse<PublicDtos.BootstrapView> bootstrap(
            @RequestParam(required = false) String locale, HttpServletRequest request) {
        return ApiResponse.ok(query.bootstrap(query.resolveLocale(locale, request.getHeader("Accept-Language"))));
    }

    /** 首页聚合：轮播 / 产品瓷砖 / 视频 / 新闻 / 工程 / 关于（形状对齐前端 HomeData）。 */
    @GetMapping("/home")
    public ApiResponse<PublicDtos.HomeView> home(
            @RequestParam(required = false) String locale, HttpServletRequest request) {
        return ApiResponse.ok(query.home(query.resolveLocale(locale, request.getHeader("Accept-Language"))));
    }

    // ------------------------------------------------------------------
    // 首页分区块端点：每个区块一次请求，前端并行获取、日志语义化
    // ------------------------------------------------------------------

    /** 轮播图：一次返回全部图片地址与跳转。 */
    @GetMapping("/home-slides")
    public ApiResponse<List<PublicDtos.HomeView.SlideView>> homeSlides(
            @RequestParam(required = false) String locale, HttpServletRequest request) {
        return ApiResponse.ok(query.homeSlides(query.resolveLocale(locale, request.getHeader("Accept-Language"))));
    }

    /** 首页产品中心瓷砖：可选 series（"1"家用/"2"工业）与 categoryId 筛选。 */
    @GetMapping("/home-products")
    public ApiResponse<PublicDtos.ProductTilesView> homeProducts(
            @RequestParam(required = false) String locale,
            @RequestParam(required = false) String series,
            @RequestParam(required = false) Long categoryId,
            HttpServletRequest request) {
        return ApiResponse.ok(query.homeProducts(
                query.resolveLocale(locale, request.getHeader("Accept-Language")), series, categoryId));
    }

    /** 首页新闻资讯区块：置顶优先 5 条滑窗 + 3 条列表。 */
    @GetMapping("/home-news")
    public ApiResponse<PublicDtos.HomeView.NewsView> homeNews(
            @RequestParam(required = false) String locale, HttpServletRequest request) {
        return ApiResponse.ok(query.homeNews(query.resolveLocale(locale, request.getHeader("Accept-Language"))));
    }

    /** 首页工程实例卡片。 */
    @GetMapping("/home-projects")
    public ApiResponse<PublicDtos.HomeView.CardsView> homeProjects(
            @RequestParam(required = false) String locale, HttpServletRequest request) {
        return ApiResponse.ok(query.homeProjectCards(query.resolveLocale(locale, request.getHeader("Accept-Language"))));
    }

    /** 首页关于我们卡片（body/readMore 直接对齐前端字段）。 */
    @GetMapping("/home-about")
    public ApiResponse<PublicDtos.AboutCardsView> homeAbout(
            @RequestParam(required = false) String locale, HttpServletRequest request) {
        return ApiResponse.ok(query.homeAboutCards(query.resolveLocale(locale, request.getHeader("Accept-Language"))));
    }

    /** 板块①滤芯系列清单（Filter Cartridges & Housings 六个子类）。 */
    @GetMapping("/fc-series")
    public ApiResponse<List<PublicDtos.SeriesItem>> fcSeries(
            @RequestParam(required = false) String locale, HttpServletRequest request) {
        return ApiResponse.ok(query.fcSeries(query.resolveLocale(locale, request.getHeader("Accept-Language"))));
    }

    // ------------------------------------------------------------------
    // 新闻
    // ------------------------------------------------------------------

    /** 新闻分页列表（置顶优先，源 id 降序）。 */
    @GetMapping("/articles")
    public ApiResponse<PublicDtos.ArticlePageView> articles(
            @RequestParam(required = false) String locale,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        int safeSize = Math.min(Math.max(size, 1), 50);
        return ApiResponse.ok(query.articles(query.resolveLocale(locale, request.getHeader("Accept-Language")),
                page, safeSize));
    }

    /** 新闻详情（sourceId 为源站 id，与前端 ?id=49 一致）。不存在时 HTTP 404 + code 404。 */
    @GetMapping("/articles/{sourceId}")
    public ResponseEntity<ApiResponse<PublicDtos.ArticleDetailView>> article(
            @PathVariable long sourceId,
            @RequestParam(required = false) String locale, HttpServletRequest request) {
        return toResponse(query.article(query.resolveLocale(locale, request.getHeader("Accept-Language")), sourceId));
    }

    // ------------------------------------------------------------------
    // 产品
    // ------------------------------------------------------------------

    /** 产品分类树（产品页侧边栏）。 */
    @GetMapping("/product-categories")
    public ApiResponse<java.util.List<PublicDtos.CategoryNode>> productCategories(
            @RequestParam(required = false) String locale, HttpServletRequest request) {
        return ApiResponse.ok(query.productCategories(query.resolveLocale(locale, request.getHeader("Accept-Language"))));
    }

    /** 产品详情：含所属分类、侧边栏分类树、同系列其它产品。不存在时 HTTP 404。 */
    @GetMapping("/products/{sourceId}")
    public ResponseEntity<ApiResponse<PublicDtos.ProductDetailView>> product(
            @PathVariable long sourceId,
            @RequestParam(required = false) String locale, HttpServletRequest request) {
        return toResponse(query.product(query.resolveLocale(locale, request.getHeader("Accept-Language")), sourceId));
    }

    // ------------------------------------------------------------------
    // 工程 / 单页 / 下载 / 站点地图
    // ------------------------------------------------------------------

    @GetMapping("/projects/{sourceId}")
    public ResponseEntity<ApiResponse<PublicDtos.ProjectDetailView>> project(
            @PathVariable long sourceId,
            @RequestParam(required = false) String locale, HttpServletRequest request) {
        return toResponse(query.project(query.resolveLocale(locale, request.getHeader("Accept-Language")), sourceId));
    }

    /** 单页（about1..4 / join / handbook）。不存在时 HTTP 404。 */
    @GetMapping("/pages/{code}")
    public ResponseEntity<ApiResponse<PublicDtos.PageDetailView>> page(
            @PathVariable String code,
            @RequestParam(required = false) String locale, HttpServletRequest request) {
        return toResponse(query.page(query.resolveLocale(locale, request.getHeader("Accept-Language")), code));
    }

    /** Optional → 统一响应体：存在返回 200，缺失返回 HTTP 404 + code 404。 */
    private <T> ResponseEntity<ApiResponse<T>> toResponse(java.util.Optional<T> data) {
        if (data.isPresent()) {
            return ResponseEntity.ok(ApiResponse.ok(data.get()));
        }
        com.aromem.cms.common.ErrorCode notFound = com.aromem.cms.common.ErrorCode.NOT_FOUND;
        return ResponseEntity.status(notFound.getHttpStatus()).body(ApiResponse.fail(notFound));
    }

    @GetMapping("/downloads")
    public ApiResponse<java.util.List<PublicDtos.DownloadItem>> downloads(
            @RequestParam(required = false) String locale, HttpServletRequest request) {
        return ApiResponse.ok(query.downloads(query.resolveLocale(locale, request.getHeader("Accept-Language"))));
    }

    /** 全站可访问资源清单（前端生成路由 / 站点地图用）。 */
    @GetMapping("/sitemap")
    public ApiResponse<PublicDtos.SitemapView> sitemap() {
        return ApiResponse.ok(query.sitemap());
    }
}
