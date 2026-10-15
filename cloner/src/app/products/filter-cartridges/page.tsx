import type { Metadata } from "next";
import FcShell from "@/components/products/FcShell";
import QuoteForm from "@/components/products/QuoteForm";
import { FC_PREVIEW_NOTICE } from "@/data/filterCartridges";
import { fcBlocks, fcCapabilityRows } from "@/data/fcBlocks";
import { fcAlternates } from "@/lib/fcSeo";
import { getFcSeries } from "@/services/cms/filterCartridges";

export const metadata: Metadata = {
  title: "Filter Cartridges & Housings | SURMEM",
  description:
    "High flow, pleated, PP melt blown, string wound and compatible replacement cartridges, plus the single, multi-round and high flow housings they fit. Compare micron rating, length, media, end cap and flow rate, download the datasheet, or cross-reference the part number you are replacing.",
  alternates: fcAlternates("en", "/products/filter-cartridges"),
};

const STEPS = [
  {
    title: "1. Identify the part you run today",
    body: "Send the OEM part number, a photo or a drawing. If it is not in our cross-reference table yet, we map it manually.",
  },
  {
    title: "2. Match micron, length and end cap",
    body: "Every model page lists absolute and nominal micron rating, dimensions, media, end-cap style and flow range so the replacement fits the housing without a trial order.",
  },
  {
    title: "3. Request a quote or a sample",
    body: "Pricing, MOQ and lead time are quoted per part number. Sample policy is confirmed together with the quote.",
  },
];

export default async function FilterCartridgesLandingPage() {
  const series = await getFcSeries();
  const live = series.filter((item) => !item.comingSoon);
  const planned = series.filter((item) => item.comingSoon);
  const b = fcBlocks("en");
  const capability = fcCapabilityRows("en");

  return (
    <FcShell
      bannerTitle="Filter Cartridges & Housings"
      notice={FC_PREVIEW_NOTICE}
      crumbs={[
        { text: "Home", href: "" },
        { text: "Products", href: "/products?id=3" },
        { text: "Filter Cartridges & Housings", href: null },
      ]}
    >
      <div className="fc-head">
        <h1>Filter Cartridges &amp; Housings</h1>
        <p className="fc-lede">
          Cartridges and the housings they fit — high flow, pleated, PP melt blown, string wound and
          compatible replacement, plus single, multi-round and high flow housings. Compare micron
          rating, length, media, end cap and flow rate, download the datasheet, or ask us for pricing.
        </p>
        <div className="fc-chips">
          <span className="fc-chip">Absolute &amp; nominal micron ratings</span>
          <span className="fc-chip">Replacement &amp; compatible parts</span>
          <span className="fc-chip">Datasheet per model</span>
          <span className="fc-chip">Export documentation</span>
        </div>
      </div>

      <div className="fc-cta-bar">
        <span className="fc-cta-text">
          <b>Already know the part number?</b> Cross-reference it in one step — no account
          needed.
        </span>
        <span className="fc-cta-actions">
          <a className="fc-btn" href="/cross-reference">
            Cross-Reference Tool
          </a>
          <a className="fc-btn fc-btn-ghost" href="/request-a-quote">
            Request a Quote
          </a>
        </span>
      </div>

            <section className="fc-section" id="fc-series">
        <h2>Browse by category</h2>
        {[
          { key: "cartridge", title: "Cartridges", items: live.filter((i) => i.group !== "housing") },
          { key: "housing", title: "Housings", items: live.filter((i) => (i.group === "housing" || i.slug === "filter-housings")) },
        ].map((block) =>
          block.items.length ? (
            <div key={block.key} style={{ marginBottom: 22 }}>
              <h3 className="fc-card-title" style={{ margin: "0 0 10px" }}>
                {block.title}
              </h3>
              <div className="fc-grid">
                {block.items.map((item) => (
                  <article className="fc-card" key={item.slug}>
                    <a className="fc-card-media" href={`/en/products/filter-cartridges/${item.slug}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/product-placeholder.svg" alt={item.name} />
                    </a>
                    <div className="fc-card-body">
                      <h3 className="fc-card-title">
                        <a href={`/en/products/filter-cartridges/${item.slug}`}>{item.name}</a>
                      </h3>
                      <p className="fc-card-meta">{item.tagline}</p>
                      <div className="fc-chips">
                        {item.filterFacets.slice(0, 4).map((facet) => (
                          <span className="fc-chip" key={facet}>
                            {facet}
                          </span>
                        ))}
                      </div>
                      <div className="fc-card-actions">
                        <a className="fc-btn" href={`/en/products/filter-cartridges/${item.slug}`}>
                          View series
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null,
        )}
        {planned.length ? (
          <p className="fc-hint">
            Reserved slots for future series (structure placeholders, not yet published):{" "}
            {planned.map((item) => item.name).join(" · ")}
          </p>
        ) : null}
      </section>

      {/* 新增区块 1：产品线能力（参数未到时自动标占位） */}
      <section className="fc-section" id="fc-capability">
        <h2>{b.capability.title}</h2>
        <p className="fc-lede">{b.capability.intro}</p>
        <table className="fc-spec">
          <tbody>
            {capability.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td
                  className={
                    /awaiting|待客户/.test(row.value) ? "fc-pending" : undefined
                  }
                >
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="fc-section" id="fc-how">
        <h2>How to choose</h2>
        <div className="fc-grid">
          {STEPS.map((step, index) => (
            <article className="fc-card fc-card-flat" key={step.title}>
              <div className="fc-card-body">
                <span className="fc-step-index">{index + 1}</span>
                <h3 className="fc-card-title">{step.title}</h3>
                <p className="fc-card-meta" style={{ margin: 0 }}>
                  {step.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 新增区块 2：为什么选 SURMEM */}
      <section className="fc-section" id="fc-why">
        <h2>{b.why.title}</h2>
        <div className="fc-grid fc-grid-4">
          {b.why.items.map((item) => (
            <article className="fc-card fc-card-flat" key={item.title}>
              <div className="fc-card-body">
                <h3 className="fc-card-title">{item.title}</h3>
                <p className="fc-card-meta" style={{ margin: 0 }}>
                  {item.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="fc-section" id="fc-docs">
        <h2>Documents &amp; support</h2>
        <table className="fc-spec">
          <tbody>
            <tr>
              <th scope="row">Datasheet</th>
              <td>One PDF per model, linked from its product page (EN, with revision date).</td>
            </tr>
            <tr>
              <th scope="row">Drawings</th>
              <td>Available on request together with the quote.</td>
            </tr>
            <tr>
              <th scope="row">Certificates</th>
              <td className="fc-pending">Not published — pending client certificates.</td>
            </tr>
            <tr>
              <th scope="row">Sample policy</th>
              <td className="fc-pending">Awaiting client confirmation.</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 新增区块 3：底部询价区（内嵌紧凑表单） */}
      <section className="fc-section fc-inquiry" id="fc-inquiry">
        <h2>{b.inquiry.title}</h2>
        <p className="fc-lede">{b.inquiry.intro}</p>
        <QuoteForm requestType="quote" locale="en" variant="compact" />
      </section>
    </FcShell>
  );
}
