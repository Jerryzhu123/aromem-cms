import type { Metadata } from "next";
import { fcAlternates } from "@/lib/fcSeo";
import { notFound } from "next/navigation";
import FcShell from "@/components/products/FcShell";
import SeriesBrowser from "@/components/products/SeriesBrowser";
import { FC_SERIES, getSeries, seriesText } from "@/data/filterCartridges";
import { crossRefHref, quoteHref, sampleHref } from "@/lib/fcLinks";
import { getFcSeriesProducts } from "@/services/cms/filterCartridges";

const LOCALE = "zh" as const;

type PageProps = { params: Promise<{ series: string }> };

/** 只预渲染已确认的系列；后续系列在 CMS 里建好后自动可访问。 */
export function generateStaticParams() {
  return FC_SERIES.filter((item) => !item.comingSoon).map((item) => ({ series: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { series } = await params;
  const item = getSeries(series);
  if (!item) return { title: "工业滤芯 | 苏州苏瑞膜 SURMEM" };
  const st = seriesText(item, LOCALE);
  return {
    title: `${st.name}——精度、尺寸与滤材规格 | 苏州苏瑞膜 SURMEM`,
    description: `${st.tagline}。可按过滤精度、尺寸、滤材、端盖与流量区间对比各型号，并直接询价或申请样品。`,
    alternates: fcAlternates("zh", `/products/filter-cartridges/${item.slug}`),
  };
}

export default async function SeriesPageZh({ params }: PageProps) {
  const { series } = await params;
  const item = getSeries(series);
  if (!item || item.comingSoon) notFound();

  const st = seriesText(item, LOCALE);
  const products = await getFcSeriesProducts(item.slug);

  return (
    <FcShell
      locale={LOCALE}
      bannerTitle={st.short}
      crumbs={[
        { text: "首页", href: "/zh" },
        { text: "产品中心", href: "/zh/products?id=22" },
        { text: "工业滤芯", href: "/zh/products/filter-cartridges" },
        { text: st.short, href: null },
      ]}
    >
      <div className="fc-head">
        <h1>{st.name}</h1>
        <p className="fc-lede">{st.intro}</p>
      </div>

      <div className="fc-cta-bar">
        <span className="fc-cta-text">
          需要价格、起订量或样品？告诉我们型号，我们回复货期与报价。
        </span>
        <span className="fc-cta-actions">
          <a className="fc-btn" href={quoteHref(LOCALE)}>
            获取报价
          </a>
          <a className="fc-btn fc-btn-ghost" href={sampleHref(LOCALE)}>
            申请样品
          </a>
          <a className="fc-btn fc-btn-ghost" href={crossRefHref(LOCALE)}>
            型号对照
          </a>
        </span>
      </div>

      <SeriesBrowser products={products} facets={st.facets} locale={LOCALE} />

      <section className="fc-section" id="fc-applications" style={{ marginTop: 40 }}>
        <h2>典型应用</h2>
        <p className="fc-lede">
          工业水处理、反渗透与纳滤前的预处理、化工工艺、食品饮料，以及通用工艺过滤。
        </p>
        <p className="fc-hint">
          逐型号的行业归属存在结构化字段（application_industries）里，数据入库后可直接用于筛选。
        </p>
      </section>

      <section className="fc-section" id="fc-help">
        <h2>找不到你的型号？</h2>
        <p className="fc-lede">
          把你正在替换的型号发给我们——能附上滤芯和滤壳的照片更好——我们人工帮你对照。
        </p>
        <a className="fc-btn" href={quoteHref(LOCALE)}>
          发送型号给工程师
        </a>
      </section>
    </FcShell>
  );
}
