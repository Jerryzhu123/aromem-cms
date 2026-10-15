import "@/app/fc.css";
import type { Crumb } from "@/types/content";
import { enFooter, enNav, zhFooter, zhNav } from "@/data/nav";
import { fcText, type FcLocale } from "@/data/fcText";
import Breadcrumb from "@/components/site/Breadcrumb";
import PageBanner from "@/components/site/PageBanner";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";

/**
 * 滤芯产品线专用页面壳（中英文共用）。
 *
 * 为什么不复用 ClonedPage：
 *  - ClonedPage 是「克隆页」壳：banner + breadcrumb + 静态富文本，数据来自 pages.json；
 *  - 滤芯栏目是**结构化数据驱动**（规格表、兼容型号、筛选器、表单），需要自己的区块与 CTA。
 * 两者共用同一套页头 / 页脚 / banner / 面包屑组件，视觉上仍然是一个站。
 *
 * locale="zh" 时自动切到中文导航/页脚与中文 banner（mu-page-header-product）。
 */
export default function FcShell({
  locale = "en",
  bannerTitle,
  crumbs,
  notice,
  children,
}: {
  locale?: FcLocale;
  bannerTitle: string;
  crumbs: Crumb[];
  /** 不传时使用该语言的默认提示条文案（说明当前是结构演示）。 */
  notice?: string;
  children: React.ReactNode;
}) {
  const zh = locale === "zh";
  const t = fcText(locale);

  return (
    <>
      <SiteHeader
        nav={zh ? zhNav : enNav}
        home={zh ? "/zh" : "/"}
        lang={zh ? "zh" : "en"}
      />
      <PageBanner
        banner={{
          id: zh ? "mu-page-header-product" : "mu-page-header-producten",
          html: `<h1>${bannerTitle}</h1>`,
        }}
      />
      <Breadcrumb items={crumbs} />
      <main className="fc-page">
        <div className="container">
          <div className="fc-notice">{notice ?? t.previewNotice}</div>
          {children}
        </div>
      </main>
      <SiteFooter config={zh ? zhFooter : enFooter} />
    </>
  );
}
