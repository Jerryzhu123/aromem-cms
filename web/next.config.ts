import type { NextConfig } from "next";

/**
 * SURMEM 前台配置（预渲染 + 按需再生成，Node 常驻进程 + Nginx 反代）。
 *
 * 为什么从 output:"export" 改掉：
 *   纯静态导出的产物在构建那一刻烘焙死，后台改完数据必须重新构建整个站点
 *   才能反映到页面上（实测改标题、下架商品均不生效）。改成 standalone 后，
 *   页面依然在构建期预渲染，访问命中缓存，速度不变；区别是缓存带了标签，
 *   后台保存成功后调用 /api/revalidate 吊销标签，下次访问按需重新渲染。
 *
 * 服务器形态：
 *   静态资源（图片、脚本、样式）仍由 Nginx 直出，不经 Node；
 *   页面请求反代到本机 Node 进程。Nginx 保留旧的静态目录作为 502 降级兜底。
 *
 * 接口代理：
 *   仍由 Nginx 承担（/api/v1 → 8080）。页面自身取数不走浏览器，
 *   而是在服务端直接请求后端（见 src/lib/pool-api.ts，用 POOL_API_BASE 区分
 *   构建机与运行期的地址）。
 *
 * 图片：
 *   一律用原生 <img> / CSS 背景，关闭 Next 图片优化服务。
 */
const nextConfig: NextConfig = {
  output: "standalone",
  trailingSlash: false,
  images: { unoptimized: true },
};

export default nextConfig;
