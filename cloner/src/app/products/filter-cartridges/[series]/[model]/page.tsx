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
  FC_PREVIEW_NOTICE,
  FC_PRODUCTS,
  FC_SERIES,
  PENDING,
  getSeries,
} from "@/data/filterCartridges";
import { fcBlocks } from "@/data/fcBlocks";
import { fcText } from "@/data/fcText";
import { dualValue, pickDatasheet } from "@/lib/fcDetail";
import { fcAlternates } from "@/lib/fcSeo";
import { quoteHref as quoteLink } from "@/lib/fcLinks";
import { getFcProduct, getFcSeriesProducts } from "@/services/cms/filterCartridges";

type PageProps = { params: Promise<{ series: string; model: string }> };

export function generateStaticParams() {
  return FC_PRODUCTS.filter((product) =>
    FC_SERIES.some((item) => item.slug === product.seriesSlug && !item.comingSoon),
  ).map((product) => ({ series: product.seriesSlug, model: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { series, model } = await params;
  const product = await getFcProduct(series, model);
  if (!product) return { title: "Filter Cartridge | SURMEM" };
  return {
    title: product.seoTitle,
    description: product.seoDescription,
    alternates: fcAlternates(
      "en",
      `/en/products/filter-cartridges/${product.seriesSlug}/${product.slug}`,
    ),
  };
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  const pending = !value || value === PENDING;
  return (
    <div>
      <b>{label}:</b>{" "}
      <span className={pending ? "fc-pending" : undefined}>{value || PENDING}</span>
    </div>
  );
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { series, model } = await params;
  const item = getSeries(series);
  if (!item || item.comingSoon) notFound();

  const product = await getFcProduct(series, model);
  if (!product) notFound();

  const siblings = (await getFcSeriesProducts(series)).filter(
    (candidate) => candidate.slug !== product.slug,
  );
  const t = fcText("en");
  const b = fcBlocks("en");
  const quoteHref = quoteLink("en", {
    part: product.model,
    series: product.seriesSlug,
    model: product.slug,
  });
  const datasheet = pickDatasheet(product.documents, "en");

  return (
    <FcShell
      bannerTitle={item.short}
      notice={FC_PREVIEW_NOTICE}
      crumbs={[
        { text: "Home", href: "" },
        { text: "Products", href: "/products?id=3" },
        { text: "Filter Cartridges", href: "/products/filter-cartridges" },
        { text: item.short, href: `/en/products/filter-cartridges/${item.slug}` },
        { text: product.model, href: null },
      ]}
    >
      <div className="fc-detail-top">
        <ProductGallery images={product.gallery} alt={product.model} locale="en" />
        <div>
          <h1>{product.model}</h1>
          <p className="fc-lede">{product.subtitle}</p>
          <div className="fc-summary-line">
            <SummaryLine label="Series" value={item.name} />
            <SummaryLine label="Micron rating (absolute)" value={product.micronAbsolute} />
            <SummaryLine
              label="Overall length"
              value={dualValue(
                product.overallLength,
                product.overallLengthUnit,
                PENDING,
                "en",
                "length",
              )}
            />
            <SummaryLine
              label="Outside diameter"
              value={dualValue(
                product.outsideDiameter,
                product.outsideDiameterUnit,
                PENDING,
                "en",
                "length",
              )}
            />
            <SummaryLine label="End cap" value={product.endCap} />
          </div>
          <div className="fc-actions-row">
            <a className="fc-btn" href={quoteHref}>
              Request a Quote
            </a>
            <a className="fc-btn fc-btn-ghost" href={`/en/request-a-sample?part=${encodeURIComponent(product.model)}`}>
              Request a Sample
            </a>
            <a
              className="fc-btn fc-btn-ghost"
              href={`/en/cross-reference?q=${encodeURIComponent(product.model)}`}
            >
              Cross-reference this model
            </a>
            {datasheet ? (
              datasheet.fileUrl ? (
                <a className="fc-btn fc-btn-ghost" href={datasheet.fileUrl} download>
                  {b.datasheet.download}
                </a>
              ) : (
                <span className="fc-btn fc-btn-ghost is-disabled" title={b.datasheet.pending}>
                  {b.datasheet.pending}
                </span>
              )
            ) : null}
          </div>
        </div>
      </div>

      <section className="fc-section" id="fc-spec">
        <h2>Specifications</h2>
        <SpecTable product={product} />
      </section>

      <section className="fc-section" id="fc-compatible">
        <h2>Replacement &amp; compatible part numbers</h2>
        <CompatibleTable rows={product.compatibleModels} />
      </section>

      <section className="fc-section" id="fc-applications">
        <h2>Applications</h2>
        <p className="fc-lede">
          {product.applicationIndustries.filter((v) => v !== PENDING).length
            ? product.applicationIndustries.join(" · ")
            : "Awaiting client data — per-model application industries are stored as a structured field."}
        </p>
      </section>

      {/* 认证块：无证书时整块不渲染，避免出现“空说明” */}
      {product.certifications.length ? (
        <section className="fc-section" id="fc-compliance">
          <h2>Compliance &amp; certifications</h2>
          <ul className="fc-cert-list">
            {product.certifications.map((cert) => (
              <li key={cert}>{cert}</li>
            ))}
          </ul>
          <p className="fc-hint">{b.certs.hidden}</p>
        </section>
      ) : null}

      <section className="fc-section" id="fc-documents">
        <h2>Documents</h2>
        <DocumentList documents={product.documents} />
      </section>

      {siblings.length ? (
        <section className="fc-section" id="fc-related">
          <h2>Other models in this series</h2>
          <div className="fc-grid">
            {siblings.map((sibling) => (
              <ProductCard key={sibling.slug} product={sibling} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="fc-section fc-inquiry" id="fc-quote">
        <h2>{b.inquiry.title}</h2>
        <p className="fc-lede">{b.inquiry.intro}</p>
        <QuoteForm requestType="quote" locale="en" variant="compact" />
        <p className="fc-hint">
          Need the full form (quantities, destination port, lead time)?{" "}
          <a href={quoteHref}>{t.requestQuote}</a>
        </p>
      </section>
    </FcShell>
  );
}
