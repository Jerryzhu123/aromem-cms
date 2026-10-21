package com.aromem.cms.content;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

/**
 * 公开只读接口的响应形状（P2）。
 *
 * <p>命名对齐前端 {@code cloner/src/types} 的现有类型（HomeData / NavItem / PageData），
 * 前端切换数据源时组件不需要改动。仅 detail 接口额外补充后端规范字段
 * （{@code sourceId} / {@code locale}）。
 */
final class PublicDtos {

    private PublicDtos() {
    }

    /** /site/bootstrap 的整体形状。 */
    record BootstrapView(
            String locale,
            long revision,
            List<NavNode> nav,
            FooterView footer,
            Map<String, String> banners) {
    }

    /** 对齐前端 NavItem：{ label, href, children? }。 */
    record NavNode(String label, String href, List<NavNode> children) {
    }

    /** 对齐前端 zhFooter 形状：col1/col2/col3 + contact + copyright + icp。 */
    record FooterView(
            FooterColumn col1,
            FooterColumn col2,
            FooterColumn col3,
            ContactInfo contact,
            String copyright,
            IcpInfo icp) {

        record FooterColumn(String title, List<LinkItem> links) {
        }

        record LinkItem(String label, String href) {
        }

        record ContactInfo(String title, String address, String phone, String qr, List<String> emails) {
        }

        record IcpInfo(String label, String href) {
        }
    }

    // ------------------------------------------------------------------
    // /home —— 对齐前端 HomeData
    // ------------------------------------------------------------------

    record HomeView(
            String lang,
            List<SlideView> slider,
            PortfolioView portfolio,
            VideoView video,
            NewsView news,
            CardsView projects,
            CardsView about) {

        record SlideView(String src, String alt, String linkUrl) {
        }

        record PortfolioView(String title, List<FilterView> filters, List<ItemView> items) {

            record FilterView(String filter, String label) {
            }

            /** 对齐前端 PortfolioItem：category 为分区 board（cartridges / ro / accessories）。 */
            record ItemView(String category, String full, String title, String thumb, String alt,
                            String link) {
            }
        }

        record VideoView(String heading, String body, String src) {
        }

        record NewsView(String title, List<SlideItem> slides, List<ListItem> list, Button button) {

            record SlideItem(String href, String image, String caption) {
            }

            record ListItem(String href, String title, String excerpt) {
            }

            record Button(String href, String label) {
            }
        }

        record CardsView(String title, List<Card> cards) {

            record Card(String href, String title, String subtitle, String image) {
            }
        }
    }

    // ------------------------------------------------------------------
    // 新闻
    // ------------------------------------------------------------------

    record ArticleListItem(
            long sourceId,
            String title,
            String summary,
            String coverUrl,
            boolean isTop,
            String href) {
    }

    record ArticlePageView(int page, int size, long total, int totalPages, List<ArticleListItem> items) {
    }

    record ArticleDetailView(
            long sourceId,
            String locale,
            String title,
            String publishedAt,
            String contentHtml,
            List<Map<String, String>> breadcrumb) {
    }

    // ------------------------------------------------------------------
    // 产品
    // ------------------------------------------------------------------

    record CategoryNode(long id, String name, List<CategoryNode> children) {
    }

    record ProductDetailView(
            long sourceId,
            String locale,
            String title,
            String coverUrl,
            String contentHtml,
            CategoryNode category,
            List<CategoryNode> categoryTree,
            List<RelatedProduct> sameCategory) {

        record RelatedProduct(long sourceId, String title, String coverUrl, String href) {
        }
    }

    // ------------------------------------------------------------------
    // 工程 / 单页 / 下载 / 站点地图
    // ------------------------------------------------------------------

    record ProjectDetailView(
            long sourceId,
            String locale,
            String title,
            String subtitle,
            String coverUrl,
            String contentHtml) {
    }

    record PageDetailView(
            String code,
            String locale,
            String title,
            String bannerKey,
            String contentHtml) {
    }

    record DownloadItem(long id, String title, String category, String fileUrl, Long fileSizeBytes) {
    }

    /** 板块①滤芯系列条目（一次返回双语全量字段，前台按语言自取）。 */
    record SeriesItem(long id, String slug, String nameZh, String nameEn,
                      String taglineZh, String taglineEn,
                      // V9 迁移的列：系列图标（媒体库 relativeUrl，如 /media/2026/10/x.png）
                      String iconUrl,
                      List<String> facetsZh, List<String> facetsEn, boolean comingSoon,
                      // V11：系列级模板文案。整个系列共用一份，所以挂系列不挂型号——
                      // 复制进每行会导致改一个字要改几十行。
                      List<String> checklistZh, List<String> checklistEn,
                      String verificationZh, String verificationEn,
                      // V12：品类页「选择类别」药丸的字典（微孔折叠/大流量/多折用得到）
                      List<SubcatItem> subcats) {
    }

    /** 子分类字典的一项：key 与型号上的 subcats 对应，两个 label 用于双语渲染 */
    record SubcatItem(String key, String labelZh, String labelEn) {
    }

    record SitemapView(
            long revision,
            List<SitemapEntry> articles,
            List<SitemapEntry> products,
            List<SitemapEntry> projects,
            List<SitemapPage> pages) {

        record SitemapEntry(String locale, long sourceId, String title, String updatedAt) {
        }

        record SitemapPage(String locale, String code, String title, String updatedAt) {
        }
    }

    // ------------------------------------------------------------------
    // 首页分区块端点（/home-slides /home-products /home-news /home-projects /home-about）
    // 每个区块一次请求，前端并行获取；/home 聚合保留作兼容。
    // ------------------------------------------------------------------

    /** 产品瓷砖：series "1"=家用 / "2"=工业（与源站筛选项一致）；categoryId 预留真分类筛选。 */
    record ProductTilesView(
            String title,
            List<HomeView.PortfolioView.FilterView> filters,
            List<HomeView.PortfolioView.ItemView> items) {
    }

    /** 关于卡片：字段名直接对齐前端 AboutCard（body/readMore），省掉前端再映射。 */
    record AboutCardsView(String title, List<AboutCard> cards) {

        record AboutCard(
                String image,
                String title,
                String body,
                String href,
                String readMore) {
        }
    }
}
