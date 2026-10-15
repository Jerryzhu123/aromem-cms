import type { HomeData } from "@/types/home";

/** 不经语言前缀的静态资源 / 接口根路径。 */
const STATIC_ROOTS = new Set([
  "/api",
  "/uploads",
  "/static",
  "/media",
  "/ueditor",
  "/images",
  "/_next",
]);

/**
 * 把 CMS 返回的站内链接归一到当前语系。
 *
 * 站点路由：英文站在根路径，中文站在 /zh 下。后台数据里两种写法都存在：
 *   - 中文条目存的是裸路径（/products/..., /news_detail?id=...）-> 中文站要补 /zh；
 *   - 英文条目（旧数据）存的是带 /en 的路径 -> 英文站要去掉 /en。
 * 同一块数据同时服务中英文，后台里只有一个字段，所以只能在渲染时归一。
 */
export function localeHref(
  href: string | null | undefined,
  locale: "zh" | "en",
): string | undefined {
  if (!href) return undefined;
  if (!href.startsWith("/")) return href; // 锚点 / mailto / 外链不动
  if (STATIC_ROOTS.has("/" + href.split("/")[1])) return href;
  if (href === "/en" || href.startsWith("/en/")) {
    // 旧英文路径：英文站直接映射到根路径；中文站不认这种写法，保持原样交给重定向
    if (locale !== "en") return href;
    return href === "/en" ? "/" : href.slice(3);
  }
  if (locale !== "zh") return href;
  if (href === "/") return "/zh";
  if (href === "/zh" || href.startsWith("/zh/")) return href; // 幂等
  return `/zh${href}`;
}

/** 把首页各区块数据里的站内链接统一过一遍语言归一。 */
export function prefixHomeLinks(home: HomeData, locale: "zh" | "en"): HomeData {
  const h = (v?: string) => localeHref(v, locale);
  return {
    ...home,
    portfolio: home.portfolio
      ? {
          ...home.portfolio,
          items: home.portfolio.items.map((it) => ({ ...it, link: h(it.link) })),
        }
      : home.portfolio,
    news: home.news
      ? {
          ...home.news,
          slides: home.news.slides.map((s) => ({ ...s, href: h(s.href) ?? s.href })),
          list: home.news.list.map((l) => ({ ...l, href: h(l.href) ?? l.href })),
          button: home.news.button
            ? { ...home.news.button, href: h(home.news.button.href) ?? home.news.button.href }
            : home.news.button,
        }
      : home.news,
    projects: home.projects
      ? {
          ...home.projects,
          cards: home.projects.cards.map((c) => ({ ...c, href: h(c.href) ?? c.href })),
        }
      : home.projects,
    about: home.about
      ? {
          ...home.about,
          cards: home.about.cards.map((c) => ({ ...c, href: h(c.href) ?? c.href })),
        }
      : home.about,
  };
}
