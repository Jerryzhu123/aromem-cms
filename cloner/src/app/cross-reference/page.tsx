import type { Metadata } from "next";
import { fcAlternates } from "@/lib/fcSeo";
import FcShell from "@/components/products/FcShell";
import CrossReferenceTool from "@/components/products/CrossReferenceTool";
import {
  FC_COMPATIBLE_BRANDS,
  FC_CROSS_REFERENCE,
  FC_PREVIEW_NOTICE,
} from "@/data/filterCartridges";

export const metadata: Metadata = {
  title: "Cross-Reference — Find the SURMEM Equivalent | SURMEM",
  description:
    "Enter a competitor or SURMEM part number to find the matching filter cartridge. Cross-reference results show the relationship (direct replacement, compatible, similar spec) and link to the datasheet.",
  alternates: fcAlternates("en", "/cross-reference"),
};

const STEPS = [
  {
    title: "1. Enter the part number you run today",
    body: "Spacing, dashes and letter case are ignored, so you can paste the number straight from a purchase order.",
  },
  {
    title: "2. Check the relationship",
    body: "We label every match: direct replacement, compatible, or similar specification. Anything we cannot confirm is left unmapped rather than guessed.",
  },
  {
    title: "3. Quote or sample the match",
    body: "Open the product page for the full specification table and datasheet, then request pricing or a sample in one click.",
  },
];

export default function CrossReferencePage() {
  return (
    <FcShell
      bannerTitle="Cross-Reference"
      notice={FC_PREVIEW_NOTICE}
      crumbs={[
        { text: "Home", href: "" },
        { text: "Cross-Reference", href: null },
      ]}
    >
      <div className="fc-head">
        <h1>Find the SURMEM equivalent</h1>
        <p className="fc-lede">
          Enter a competitor part number — or one of our own — to see the matching SURMEM
          filter cartridge. Our cross-reference table is built part by part, so anything not
          listed yet is mapped manually by our export desk.
        </p>
      </div>

      <CrossReferenceTool rows={FC_CROSS_REFERENCE} brands={FC_COMPATIBLE_BRANDS} />

      <section className="fc-section" id="fc-how">
        <h2>How cross-referencing works</h2>
        <div className="fc-grid">
          {STEPS.map((step) => (
            <article className="fc-card" key={step.title}>
              <div className="fc-card-body">
                <h3 className="fc-card-title">{step.title}</h3>
                <p className="fc-card-meta" style={{ margin: 0 }}>
                  {step.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="fc-section" id="fc-manual">
        <h2>Not in the table yet?</h2>
        <p className="fc-lede">
          Send the part number, the housing it sits in, and a photo or drawing if you have
          one. We come back with the closest match and the differences that matter — length,
          end cap, media and micron rating.
        </p>
        <a className="fc-btn" href="/request-a-quote">
          Send us a part number
        </a>
      </section>
    </FcShell>
  );
}
