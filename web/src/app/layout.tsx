import type { Metadata } from "next";
import Providers from "@/components/Providers";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import "@/styles/site.css";
import "@/styles/header.css";
/* darlly 品类页还原样式（类名统一 dl- 前缀，与站内样式不冲突） */
import "@/styles/darlly.css";
import "@/styles/darlly-detail.css";
/* 泳池滤芯单品页（类名统一 pl- 前缀） */
import "@/styles/pool.css";
/* 设计稿插画原码（放最后加载：与 site.css 同名选择器时以原稿为准） */
import "@/styles/demo-art.css";

/** 全站默认搜索引擎信息（各页面用自己的 metadata 覆盖标题与描述） */
export const metadata: Metadata = {
  title: {
    default: "SURMEM | Industrial Filtration Solutions",
    template: "%s | SURMEM",
  },
  description:
    "Industrial filter cartridges and RO membranes for distributors, importers and private-label partners. Request a quote for your filtration sourcing requirements.",
  keywords:
    "SURMEM, filter cartridges, pleated filter cartridges, high flow filters, RO membranes, OEM private label, industrial filtration",
};

/** 根布局：页头 + 页面 + 页脚，antd 配置包裹全站 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
