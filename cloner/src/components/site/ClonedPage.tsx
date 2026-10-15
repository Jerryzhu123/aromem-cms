import type { PageData } from "@/types/content";
import { enFooter, enNav, zhFooter, zhNav } from "@/data/nav";
import Breadcrumb from "./Breadcrumb";
import PageBanner from "./PageBanner";
import RichContent from "./RichContent";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

/**
 * The shared shell every inner page uses:
 *   header → page banner → breadcrumb → page body → footer
 *
 * All ~90 inner pages (about / news / products / projects / join / handbook,
 * in both languages) are composed from this single component plus their own
 * extracted data.
 */
export default function ClonedPage({
  page,
  lang = "zh",
}: {
  page: PageData;
  lang?: "zh" | "en";
}) {
  const isEn = lang === "en";

  return (
    <>
      <SiteHeader nav={isEn ? enNav : zhNav} home={isEn ? "/" : "/zh"} lang={lang} />
      {page.banner ? <PageBanner banner={page.banner} /> : null}
      <Breadcrumb items={page.breadcrumb} />
      <RichContent html={page.content} />
      <SiteFooter config={isEn ? enFooter : zhFooter} />
    </>
  );
}
