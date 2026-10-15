/**
 * CMS 内容 API 层（服务端组件专用）—— 按区块拆分的数据请求。
 *
 * 数据流（与你看到的网络请求一一对应）：
 *   ① 首页渲染时并行发 5 个语义化请求（每个区块一次，见 getHomeData）：
 *        /api/v1/home-slides    轮播图（一次拿全部图片地址）
 *        /api/v1/home-products  产品中心（可按类目 series/categoryId 筛选）
 *        /api/v1/home-news      新闻资讯
 *        /api/v1/home-projects  工程实例
 *        /api/v1/home-about     关于我们
 *   ② 图片/视频/PDF 不走数据接口：数据里只有相对路径，
 *      浏览器按 <img src> 直接加载（经 next.config 代理到后端 8080），
 *      有多少张图就加载多少个资源请求，没有任何隐形预取。
 */
import { request } from "./client";
import { localeHref } from "@/lib/localeHref";

/** 轮播图单条：src 即图片地址。 */
export interface CmsSlide {
  src: string;
  alt: string;
  linkUrl?: string | null;
}

/** 产品中心瓷砖单条。 */
export interface CmsProductTile {
  category: string;
  full: string;
  title: string;
  thumb: string;
  alt: string;
  /** 点击跳转的站内链接（后台配置；渲染时按语系归一）。 */
  link?: string;
}

/** 新闻区块。 */
export interface CmsNewsSection {
  title: string;
  slides: { href: string; image: string; caption: string }[];
  list: { href: string; title: string; excerpt: string }[];
  button: { href: string; label: string } | null;
}

/** 工程实例卡片区块。 */
export interface CmsCardsSection {
  title: string;
  cards: { href: string; title: string; subtitle: string; image: string }[];
}

/** 关于我们卡片区块（后端字段名直接对齐前端）。 */
export interface CmsAboutSection {
  title: string;
  cards: {
    image: string;
    title: string;
    body: string;
    href: string;
    readMore: string;
  }[];
}

/** 组装给首页的完整数据（各区块字段对齐前端 HomeData）。 */
export interface HomeSections {
  slider: CmsSlide[];
  portfolio: {
    title: string;
    filters: { filter: string; label: string }[];
    items: CmsProductTile[];
  };
  news: CmsNewsSection | null;
  projects: CmsCardsSection | null;
  about: CmsAboutSection | null;
}

export const contentApi = {
  /** ① 轮播图：一次拿全部。 */
  homeSlides: (lang: "zh" | "en") =>
    request<CmsSlide[]>("/api/v1/home-slides", {
      locale: lang === "en" ? "en-US" : "zh-CN",
    }),

  /** ② 产品中心：series "1"家用 / "2"工业 / 缺省全部；categoryId 预留真分类筛选。 */
  homeProducts: (lang: "zh" | "en", series?: string) =>
    request<{ title: string; filters: { filter: string; label: string }[]; items: CmsProductTile[] }>(
      "/api/v1/home-products",
      {
        locale: lang === "en" ? "en-US" : "zh-CN",
        series: series || undefined,
      },
    ).then((res) =>
      res
        ? {
            ...res,
            items: (res.items ?? []).map((it) => ({ ...it, link: localeHref(it.link, lang) })),
          }
        : res,
    ),

  /** ③ 新闻资讯区块。 */
  homeNews: (lang: "zh" | "en") =>
    request<CmsNewsSection>("/api/v1/home-news", {
      locale: lang === "en" ? "en-US" : "zh-CN",
    }),

  /** ④ 工程实例区块。 */
  homeProjects: (lang: "zh" | "en") =>
    request<CmsCardsSection>("/api/v1/home-projects", {
      locale: lang === "en" ? "en-US" : "zh-CN",
    }),

  /** ⑤ 关于我们区块。 */
  homeAbout: (lang: "zh" | "en") =>
    request<CmsAboutSection>("/api/v1/home-about", {
      locale: lang === "en" ? "en-US" : "zh-CN",
    }),

  /** 单页富文本（about1..4 / join / handbook）。 */
  page: (code: string, lang: "zh" | "en") =>
    request<{ code: string; contentHtml: string }>(`/api/v1/pages/${code}`, {
      locale: lang === "en" ? "en-US" : "zh-CN",
    }),

  /** 产品手册列表（下载中心）。 */
  downloads: (lang: "zh" | "en") =>
    request<
      { id: number; title: string; category: string; fileUrl: string; fileSizeBytes: number | null }[]
    >("/api/v1/downloads", {
      locale: lang === "en" ? "en-US" : "zh-CN",
    }),
};

/**
 * 首页数据组装：并行发 5 个区块请求（每个区块一次），任一区块失败用
 * null 占位，由页面组件决定兜底形态；整体失败向上抛，走静态数据兜底。
 */
export async function getHomeSections(lang: "zh" | "en"): Promise<HomeSections> {
  const [slider, portfolio, news, projects, about] = await Promise.all([
    contentApi.homeSlides(lang),
    contentApi.homeProducts(lang),
    contentApi.homeNews(lang).catch(() => null),
    contentApi.homeProjects(lang).catch(() => null),
    contentApi.homeAbout(lang).catch(() => null),
  ]);

  if (!slider || !portfolio) throw new Error("核心区块（轮播/产品）获取失败");

  const h = (v?: string) => localeHref(v, lang);

  return {
    slider: slider.map((s) => ({ src: s.src, alt: s.alt })),
    portfolio: {
      title: portfolio.title,
      filters: portfolio.filters,
      items: portfolio.items,
    },
    news: news
      ? {
          ...news,
          slides: (news.slides ?? []).map((s) => ({ ...s, href: h(s.href) ?? s.href })),
          list: (news.list ?? []).map((l) => ({ ...l, href: h(l.href) ?? l.href })),
          button: news.button
            ? { ...news.button, href: h(news.button.href) ?? news.button.href }
            : news.button,
        }
      : news,
    projects: projects
      ? {
          ...projects,
          cards: (projects.cards ?? []).map((c) => ({ ...c, href: h(c.href) ?? c.href })),
        }
      : projects,
    about: about
      ? {
          ...about,
          cards: (about.cards ?? []).map((c) => ({ ...c, href: h(c.href) ?? c.href })),
        }
      : about,
  };
}

/** 单页正文：返回 API 富文本，无内容或失败返回 null（调用方用静态兜底）。 */
export async function getPageContent(
  code: string,
  lang: "zh" | "en",
): Promise<string | null> {
  try {
    const view = await contentApi.page(code, lang);
    return view?.contentHtml ?? null;
  } catch {
    return null;
  }
}

/** 兼容旧调用名（静态兜底逻辑在页面组件里）。 */
export async function getHomeData(lang: "zh" | "en") {
  return getHomeSections(lang);
}
