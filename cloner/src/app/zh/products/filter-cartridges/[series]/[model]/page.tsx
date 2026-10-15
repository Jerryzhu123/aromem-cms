import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FcShell from "@/components/products/FcShell";
import SpecTable from "@/components/products/SpecTable";
import CompatibleTable from "@/components/products/CompatibleTable";
import DocumentList from "@/components/products/DocumentList";
import ProductCard from "@/components/products/ProductCard";
import ProductGallery from "@/components/products/ProductGallery";
import QuoteForm from "@/components/products/QuoteForm";
import {
  FC_PRODUCTS,
  FC_SERIES,
  getSeries,
  productText,
  seriesText,
} from "@/data/filterCartridges";
import { fcBlocks } from "@/data/fcBlocks";
import { fcText, isPending } from "@/data/fcText";
import { dualValue, pickDatasheet } from "@/lib/fcDetail";
import { crossRefHref, quoteHref, sampleHref } from "@/lib/fcLinks";
import { fcAlternates } from "@/lib/fcSeo";
import { getFcProduct, getFcSeriesProducts } from "@/services/cms/filterCartridges";

const LOCALE = "zh" as const;
const T = fcText(LOCALE);
const B = fcBlocks(LOCALE);

type PageProps = { params: Promise<{ series: string; model: string }> };

export function generateStaticParams() {
  return FC_PRODUCTS.filter((product) =>
    FC_SERIES.some((item) => item.slug === product.seriesSlug && !item.comingSoon),
  ).map((product) => ({ series: product.seriesSlug, model: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { series, model } = await params;
  const product = await getFcProduct(series, model);
  if (!product) return { title: "工业滤芯 | 苏州苏瑞膜 SURMEM" };
  const pt = productText(product, LOCALE);
  return {
    title: pt.seoTitle,
    description: pt.seoDescription,
    alternates: fcAlternates(
      LOCALE,
      `/products/filter-cartridges/${product.seriesSlug}/${product.slug}`,
    ),
  };
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  const pending = isPending(value);
  return (
    <div>
      <b>{label}：</b>
      <span className={pending ? "fc-pending" : undefined}>{pending ? T.pending : value}</span>
    </div>
  );
}

export default async function ProductDetailPageZh({ params }: PageProps) {
  const { series, model } = await params;
  const item = getSeries(series);
  if (!item || item.comingSoon) notFound();

  const product = await getFcProduct(series, model);
  if (!product) notFound();

  const st = seriesText(item, LOCALE);
  const pt = productText(product, LOCALE);
  const siblings = (await getFcSeriesProducts(series)).filter(
    (candidate) => candidate.slug !== product.slug,
  );
  const datasheet = pickDatasheet(product.documents, LOCALE);
  const quoteLink = quoteHref(LOCALE, {
    part: product.model,
    series: product.seriesSlug,
    model: product.slug,
  });

  return (
    <FcShell
      locale={LOCALE}
      bannerTitle={st.short}
      crumbs={[
        { text: "首页", href: "/zh" },
        { text: "产品中心", href: "/zh/products?id=22" },
        { text: "工业滤芯", href: "/zh/products/filter-cartridges" },
        { text: st.short, href: `/products/filter-cartridges/${item.slug}` },
        { text: product.model, href: null },
      ]}
    >
      <div className="fc-detail-top">
        <ProductGallery images={product.gallery} alt={product.model} locale={LOCALE} />
        <div>
          <h1>{product.model}</h1>
          <p className="fc-lede">{pt.subtitle}</p>
          <div className="fc-summary-line">
            <SummaryLine label="所属系列" value={st.name} />
            <SummaryLine label="过滤精度（绝对）" value={product.micronAbsolute} />
            <SummaryLine
              label="总长"
              value={dualValue(
                product.overallLength,
                product.overallLengthUnit,
                T.pending,
                LOCALE,
                "length",
              )}
            />
            <SummaryLine
              label="外径"
              value={dualValue(
                product.outsideDiameter,
                product.outsideDiameterUnit,
                T.pending,
                LOCALE,
                "length",
              )}
            />
            <SummaryLine label="端盖" value={product.endCap} />
          </div>
          <div className="fc-actions-row">
            <a className="fc-btn" href={quoteLink}>
              {T.requestQuote}
            </a>
            <a
              className="fc-btn fc-btn-ghost"
              href={sampleHref(LOCALE, { part: product.model })}
            >
              {T.requestSample}
            </a>
            <a className="fc-btn fc-btn-ghost" href={crossRefHref(LOCALE, product.model)}>
              {T.crossRefThisModel}
            </a>
            {datasheet ? (
              datasheet.fileUrl ? (
                <a className="fc-btn fc-btn-ghost" href={datasheet.fileUrl} download>
                  {B.datasheet.download}
                </a>
              ) : (
                <span className="fc-btn fc-btn-ghost is-disabled" title={B.datasheet.pending}>
                  {B.datasheet.pending}
                </span>
              )
            ) : null}
          </div>
        </div>
      </div>

      <section className="fc-section" id="fc-spec">
        <h2>规格参数</h2>
        <SpecTable product={product} locale={LOCALE} />
      </section>

      <section className="fc-section" id="fc-compatible">
        <h2>可替代 / 兼容型号</h2>
        <CompatibleTable rows={product.compatibleModels} locale={LOCALE} />
      </section>

      <section className="fc-section" id="fc-applications">
        <h2>应用行业</h2>
        <p className="fc-lede">
          {product.applicationIndustries.some((v) => !isPending(v))
            ? product.applicationIndustries.join(" · ")
            : "待客户提供资料——逐型号的行业归属存在结构化字段里。"}
        </p>
      </section>

      {/* 认证块：无证书时整块不渲染 */}
      {product.certifications.length ? (
        <section className="fc-section" id="fc-compliance">
          <h2>认证与合规</h2>
          <ul className="fc-cert-list">
            {product.certifications.map((cert) => (
              <li key={cert}>{cert}</li>
            ))}
          </ul>
          <p className="fc-hint">{B.certs.hidden}</p>
        </section>
      ) : null}

      <section className="fc-section" id="fc-documents">
        <h2>资料下载</h2>
        <DocumentList documents={product.documents} locale={LOCALE} />
      </section>

      {siblings.length ? (
        <section className="fc-section" id="fc-related">
          <h2>本系列其他型号</h2>
          <div className="fc-grid">
            {siblings.map((sibling) => (
              <ProductCard key={sibling.slug} product={sibling} locale={LOCALE} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="fc-section fc-inquiry" id="fc-quote">
        <h2>{B.inquiry.title}</h2>
        <p className="fc-lede">{B.inquiry.intro}</p>
        <QuoteForm requestType="quote" locale={LOCALE} variant="compact" />
        <p className="fc-hint">
          需要填写数量、目的港与交期？{" "}
          <a href={quoteLink}>前往完整询价表单</a>
        </p>
      </section>
    </FcShell>
  );
}
