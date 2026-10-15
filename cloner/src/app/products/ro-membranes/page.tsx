import type { Metadata } from "next";
import FcShell from "@/components/products/FcShell";
import QuoteForm from "@/components/products/QuoteForm";
import {
  RO_COMPONENT_SPECS,
  RO_SIZE_CODES,
  RO_SPEC_FIELDS,
  RO_TYPES,
  roPending,
  roText,
} from "@/data/roMembranes";
import { fcAlternates } from "@/lib/fcSeo";

const LOCALE = "en" as const;

/**
 * RO Membranes & Components (English) — landing page for the second product block.
 *
 * Two levels: type first (BWRO / ULP / LP / SWRO), then size (4040 / 8040) as the
 * filter and spec marker at the model level. All specifications stay pending until
 * the client supplies them — nothing is invented here.
 */
export const metadata: Metadata = {
  title: "RO Membranes & Components | SURMEM",
  description:
    "BWRO, ULP, LP and SWRO reverse osmosis membrane elements in 4040 and 8040 sizes, with membrane housings and components. Choose by type first, then filter by size.",
  alternates: fcAlternates(LOCALE, "/products/ro-membranes"),
};

const STEPS = [
  {
    title: "1. Send us the water analysis",
    body: "Feed TDS, temperature, required permeate flow and target recovery. Brackish and seawater are two different selections.",
  },
  {
    title: "2. Confirm the size",
    body: "4040 or 8040 depends on the vessels and the duty; for replacements just send the part you run today.",
  },
  {
    title: "3. Get the quote and datasheet",
    body: "Pricing, MOQ and lead time are quoted per model. Datasheet and test conditions come with the quote.",
  },
];

export default function RoMembranesPageEn() {
  const pending = roPending(LOCALE);

  return (
    <FcShell
      locale={LOCALE}
      bannerTitle="RO Membranes &amp; Components"
      crumbs={[
        { text: "Home", href: "" },
        { text: "Products", href: "/products?id=3" },
        { text: "RO Membranes & Components", href: null },
      ]}
    >
      <div className="fc-head">
        <h1>RO Membranes &amp; Components</h1>
        <p className="fc-lede">
          Choose by type first — brackish water, ultra-low pressure, low pressure or seawater —
          then filter and label by 4040 / 8040. Membrane housings and components belong to this
          block as well.
        </p>
        <div className="fc-chips">
          <span className="fc-chip">BWRO · ULP · LP · SWRO</span>
          <span className="fc-chip">4040 / 8040</span>
          <span className="fc-chip">Housings & components</span>
          <span className="fc-chip">Datasheet per model</span>
        </div>
      </div>

      <div className="fc-cta-bar">
        <span className="fc-cta-text">
          <b>Not sure which type fits?</b> Send the water analysis and the element you run today.
        </span>
        <span className="fc-cta-actions">
          <a className="fc-btn" href="/request-a-quote">
            Request a Quote
          </a>
        </span>
      </div>

      <section className="fc-section" id="ro-types">
        <h2>Browse by type</h2>
        <p className="fc-lede">
          Four types cover four water chemistries and energy targets. Actual models and
          specifications appear at the model level, once client data is loaded.
        </p>
        <div className="fc-grid">
          {RO_TYPES.map((type) => {
            const t = roText(type, LOCALE);
            return (
              <article className="fc-card" key={type.slug} id={type.slug}>
                <div className="fc-card-body">
                  <h3 className="fc-card-title">{t.name}</h3>
                  <p className="fc-card-meta">{t.tagline}</p>
                  <p className="fc-card-meta">{t.intro}</p>
                  <p className="fc-pending" style={{ margin: "0 0 8px", fontSize: 12 }}>
                    {t.pressure} — industry reference only, not a SURMEM specification.
                  </p>
                  <div className="fc-chips">
                    {RO_SIZE_CODES.map((size) => (
                      <span className="fc-chip" key={size}>
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="fc-section" id="ro-specs">
        <h2>What the specification table has to carry</h2>
        <p className="fc-lede">
          These ten fields are the industry standard for RO pages — leave one out and the buyer
          has to ask. Values are filled in once the client supplies them; anything missing stays
          marked pending instead of being invented.
        </p>
        <table className="fc-spec">
          <tbody>
            {RO_SPEC_FIELDS.map((field) => (
              <tr key={field.key}>
                <th scope="row">{field.label}</th>
                <td>{field.note}</td>
              </tr>
            ))}
            <tr>
              <th scope="row">Model data</th>
              <td className="fc-pending">{pending}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="fc-section" id="ro-components">
        <h2>Membrane housings &amp; components</h2>
        <p className="fc-lede">
          “Components” in this block means membrane housings (pressure vessels) and their
          fittings — not the generic accessories of the cartridge block.
        </p>
        <table className="fc-spec">
          <tbody>
            {RO_COMPONENT_SPECS.map((spec) => (
              <tr key={spec.key}>
                <th scope="row">{spec.label}</th>
                <td>{spec.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="fc-section" id="ro-how">
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

      <section className="fc-section fc-inquiry" id="ro-inquiry">
        <h2>Send us the duty and the size</h2>
        <p className="fc-lede">
          Tell us feed TDS, permeate flow required and the vessel size you run. We reply per model
          with pricing, lead time and test conditions.
        </p>
        <QuoteForm requestType="quote" locale={LOCALE} variant="compact" />
      </section>
    </FcShell>
  );
}
