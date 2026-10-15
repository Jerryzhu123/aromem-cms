import type { NextConfig } from "next";

/**
 * The source site is a classic PHP site. Every page is reachable under two
 * URL shapes, and both are used by its own markup:
 *
 *   /products?id=5.html      (query carries the extension)
 *   /products.html?id=5      (path carries the extension)
 *   /en_products?id=3.html
 *
 * The clone keeps clean App-Router paths (`/products`, `/en/products`, …) and
 * maps every one of those source URLs onto them with rewrites, so no link taken
 * from the original site dead-ends.
 */
const aliases: Array<[string, string]> = [
  // Chinese static pages
  ["/index.html", "/zh"],
  ["/indexs.html", "/zh"],
  ["/about1.html", "/zh/about1"],
  ["/about2.html", "/zh/about2"],
  ["/about3.html", "/zh/about3"],
  ["/about4.html", "/zh/about4"],
  ["/news_list.html", "/zh/news_list"],
  ["/news_detail.html", "/zh/news_detail"],
  ["/products.html", "/zh/products"],
  ["/projects.html", "/zh/projects"],
  ["/join.html", "/zh/join"],
  ["/handbook.html", "/zh/handbook"],

  // hrefs present in the source markup that 404 on the source itself
  ["/download.html", "/zh/handbook"],
  ["/about-us_3.html", "/zh/about1"],
  ["/product1_1.html", "/zh/products"],
  ["/project_1.html", "/zh/projects"],

  // English pages (source uses an `en_` prefix, clone uses an `/en/` segment)
  ["/en_indexs.html", "/"],
  ["/en_index.html", "/"],
  ["/en_about1.html", "/about1"],
  ["/en_about2.html", "/about2"],
  ["/en_about3.html", "/about3"],
  ["/en_join.html", "/join"],
  ["/en_news_list.html", "/news_list"],
  ["/en_news_detail.html", "/news_detail"],
  ["/en_products.html", "/products"],
  ["/en_projects.html", "/projects"],
  ["/en_product1_1.html", "/products"],
  ["/en_project_1.html", "/projects"],
  ["/en_about-us_1.html", "/about1"],
];

/** Add the extension-less twin of every alias (`/en_products.html` → `/en_products`). */
/**
 * 站内真实存在的干净路径（英文站现在就在根路径）。
 *
 * next.config 的 beforeFiles rewrite 先于路由匹配执行：如果给 /about1.html 顺带注册一个
 * “去掉 .html 的孪生项” /about1 -> /zh/about1，英文站自己的 /about1 就永远打不开了。
 * 所以孪生项撞上真实路由时一律不注册。
 */
const RESERVED = new Set([
  "/",
  "/about1",
  "/about2",
  "/about3",
  "/about4",
  "/cross-reference",
  "/join",
  "/news_detail",
  "/news_list",
  "/products",
  "/projects",
  "/request-a-quote",
  "/request-a-sample",
  "/handbook",
]);
function expand(pairs: Array<[string, string]>): Array<{ source: string; destination: string }> {
  const map = new Map<string, string>();
  for (const [source, destination] of pairs) {
    map.set(source, destination);
    const withoutExt = source.replace(/\.html$/, "");
    // 孪生路径撞上真实路由时跳过（否则英文站页面会被中文站抢走）
    if (withoutExt !== source && !RESERVED.has(withoutExt)) map.set(withoutExt, destination);
  }
  return [...map.entries()]
    .filter(([source, destination]) => source !== destination) // never self-rewrite
    .map(([source, destination]) => ({ source, destination }));
}

const nextConfig: NextConfig = {
  /**
   * Next.js 16 blocks dev-only resources (`/_next/hmr`) when the page is opened
   * through a host other than the one the dev server advertises. Opening the app
   * on http://127.0.0.1:3000 (rather than localhost) therefore aborts the dev
   * client bootstrap and nothing hydrates — no error, just a dead page. Listing
   * the loopback IP as an allowed dev origin keeps `npm run dev` fully
   * interactive however you reach it.
   */
  allowedDevOrigins: ["127.0.0.1", "localhost"],

  /**
   * 英文站现在占根路径，中文站在 /zh：旧的 /en/* 链接全部 301 到对应根路径，
   * 避免已有外链或书签 404。（开发期用 307，避免浏览器把 301 缓存死。）
   */
  async redirects() {
    return [
      { source: "/en", destination: "/", permanent: false },
      { source: "/en/:path*", destination: "/:path*", permanent: false },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        ...expand(aliases),
        // ---- 媒体资源统一从后端取（数据接口返回什么路径，图片就从哪来）----
        // 数据接口（/api/v1/home 等）只下发相对路径，图片/视频/PDF 由浏览器
        // 按路径直接加载，这里代理到后端 8080，与 ADP 管理后台同一资源源。
        // 生产部署时由 Nginx 做同样的转发。
        { source: "/media/:path*", destination: "http://127.0.0.1:8080/media/:path*" },
        { source: "/uploads/:path*", destination: "http://127.0.0.1:8080/uploads/:path*" },
        { source: "/ueditor/:path*", destination: "http://127.0.0.1:8080/ueditor/:path*" },
        { source: "/static/:path*", destination: "http://127.0.0.1:8080/static/:path*" },
        // 浏览器端交互（产品中心切类目）的数据请求：同源转发后端
        { source: "/api/v1/:path*", destination: "http://127.0.0.1:8080/api/v1/:path*" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
