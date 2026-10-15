import type { Metadata } from "next";
import { fcAlternates } from "@/lib/fcSeo";
import FcShell from "@/components/products/FcShell";
import QuoteForm from "@/components/products/QuoteForm";

export const metadata: Metadata = {
  title: "Request a Sample — Industrial Filter Cartridges | SURMEM",
  description:
    "Ask for a sample filter cartridge to validate fit, micron rating and end-cap style before placing a production order.",
  alternates: fcAlternates("en", "/request-a-sample"),
};

export default function RequestSamplePage() {
  return (
    <FcShell
      bannerTitle="Request a Sample"
      crumbs={[
        { text: "Home", href: "" },
        { text: "Request a Sample", href: null },
      ]}
    >
      <div className="fc-head">
        <h1>Request a Sample</h1>
        <p className="fc-lede">
          Samples are for fit and performance validation before a production order. Tell us
          the model, the housing it goes into and the application, and we will confirm
          availability together with the sample terms.
        </p>
      </div>

      <QuoteForm requestType="sample" />

      <section className="fc-section" id="fc-sample-notes" style={{ marginTop: 34 }}>
        <h2>Sample terms</h2>
        <table className="fc-spec">
          <tbody>
            <tr>
              <th scope="row">Sample cost</th>
              <td className="fc-pending">Awaiting client confirmation (free vs. charged).</td>
            </tr>
            <tr>
              <th scope="row">Freight</th>
              <td className="fc-pending">Awaiting client confirmation (paid by customer or SURMEM).</td>
            </tr>
            <tr>
              <th scope="row">Quantity limit per account</th>
              <td className="fc-pending">Awaiting client confirmation.</td>
            </tr>
            <tr>
              <th scope="row">Typical use</th>
              <td>
                Validate end-cap fit, micron rating and media compatibility on the real
                housing before a full order.
              </td>
            </tr>
          </tbody>
        </table>
        <p className="fc-hint">
          Distributors: mention your monthly volume — sample terms are agreed together with
          the first quote.
        </p>
      </section>
    </FcShell>
  );
}
