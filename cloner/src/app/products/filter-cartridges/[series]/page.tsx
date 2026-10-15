import type { Metadata } from "next";
import { fcAlternates } from "@/lib/fcSeo";
import { notFound } from "next/navigation";
import FcShell from "@/components/products/FcShell";
import SeriesBrowser from "@/components/products/SeriesBrowser";
import {
  FC_PREVIEW_NOTICE,
  FC_SERIES,
  getSeries,
} from "@/data/filterCartridges";
import { getFcSeriesProducts } from "@/services/cms/filterCartridges";

type PageProps = { params: Promise<{ series: string }> };

/** 只预渲染已确认的系列；后续系列在 CMS 里建好后自动可访问。 */
export function generateStaticParams() {
  return FC_SERIES.filter((item) => !item.comingSoon).map((item) => ({ series: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { series } = await params;
  const item = getSeries(series);
  if (!item) return { title: "Filter Cartridges | SURMEM" };
  return {
    title: `${item.name} — Micron, Length & Media Options | SURMEM`,
    description: `${item.tagline}. Compare micron rating, dimensions, media material, end cap and flow rate, then request a quote or a sample.`,
    alternates: fcAlternates("en", `/en/products/filter-cartridges/${item.slug}`),
  };
}

export default async function SeriesPage({ params }: PageProps) {
  const { series } = await params;
  const item = getSeries(series);
  if (!item || item.comingSoon) notFound();

  const products = await getFcSeriesProducts(item.slug);

  return (
    <FcShell
      bannerTitle={item.short}
      notice={FC_PREVIEW_NOTICE}
      crumbs={[
        { text: "Home", href: "" },
        { text: "Products", href: "/products?id=3" },
        { text: "Filter Cartridges", href: "/products/filter-cartridges" },
        { text: item.short, href: null },
      ]}
    >
      <div className="fc-head">
        <h1>{item.name}</h1>
        <p className="fc-lede">{item.intro}</p>
      </div>

      <div className="fc-cta-bar">
        <span className="fc-cta-text">
          Need pricing, MOQ or a sample for one of these models? Tell us the part number and
          we reply with availability.
        </span>
        <span className="fc-cta-actions">
          <a className="fc-btn" href="/request-a-quote">
            Request a Quote
          </a>
          <a className="fc-btn fc-btn-ghost" href="/request-a-sample">
            Request a Sample
          </a>
          <a className="fc-btn fc-btn-ghost" href="/cross-reference">
            Cross-Reference
          </a>
        </span>
      </div>

      <SeriesBrowser products={products} facets={item.filterFacets} />

      <section className="fc-section" id="fc-applications" style={{ marginTop: 40 }}>
        <h2>Typical applications</h2>
        <p className="fc-lede">
          Industrial water treatment, pre-treatment ahead of RO and NF trains, chemical
          processing, food and beverage, and general process filtration.
        </p>
        <p className="fc-hint">
          Per-model industry mapping is stored as a structured field (`application_industries`)
          and will filter this list once the product data is loaded.
        </p>
      </section>

      <section className="fc-section" id="fc-help">
        <h2>Cannot find your model?</h2>
        <p className="fc-lede">
          Send the part number you are replacing — or a photo of the cartridge and the housing
          — and we will match it manually.
        </p>
        <a className="fc-btn" href="/request-a-quote">
          Send us a part number
        </a>
      </section>
    </FcShell>
  );
}
