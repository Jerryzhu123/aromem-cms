import type { NextConfig } from "next";

/**
 * SURMEM 英文站配置（方案 A：构建时静态生成，Nginx 托管）。
 *
 * - output: "export"：`npm run build` 直接产出 out/ 纯静态目录，服务器上
 *   不再需要 Node 常驻进程（省内存），页面由 Nginx 直接下发；
 * - 不支持 rewrites：接口代理由服务器 Nginx 承担（/api/v1 → 8080，已在
 *   aromem.conf 里配好）；本地开发时表单提交默认打相对路径，
 *   可用环境变量 NEXT_PUBLIC_API_BASE 指向带跨域许可的后端；
 * - 图片一律用原生 <img> / CSS 背景，关闭 Next 图片优化服务
 *   （静态导出没有图片优化运行时）。
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: false,
  images: { unoptimized: true },
};

export default nextConfig;
