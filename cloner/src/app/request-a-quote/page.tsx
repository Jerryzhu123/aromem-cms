import type { Metadata } from "next";
import { fcAlternates } from "@/lib/fcSeo";
import FcShell from "@/components/products/FcShell";
import QuoteForm from "@/components/products/QuoteForm";

export const metadata: Metadata = {
  title: "Request a Quote — Industrial Filter Cartridges | SURMEM",
  description:
    "Send a part number, quantity and destination and our export desk replies with pricing, MOQ and lead time for industrial filter cartridges.",
  alternates: fcAlternates("en", "/request-a-quote"),
};

export default function RequestQuotePage() {
  return (
    <FcShell
      bannerTitle="Request a Quote"
      crumbs={[
        { text: "Home", href: "" },
        { text: "Request a Quote", href: null },
      ]}
    >
      <div className="fc-head">
        <h1>Request a Quote</h1>
        <p className="fc-lede">
          Four fields are enough to start: name, company, work email and the part number.
          Everything else helps us quote faster — distributors are routed to our export desk
          first.
        </p>
      </div>

      <QuoteForm requestType="quote" />

      <section className="fc-section" id="fc-quote-notes" style={{ marginTop: 34 }}>
        <h2>What happens next</h2>
        <table className="fc-spec">
          <tbody>
            <tr>
              <th scope="row">1. Acknowledgement</th>
              <td>We confirm we received the part number and flag anything missing.</td>
            </tr>
            <tr>
              <th scope="row">2. Cross-reference / fit check</th>
              <td>
                If the number is not ours, we map it and tell you where the specification
                differs.
              </td>
            </tr>
            <tr>
              <th scope="row">3. Quote</th>
              <td>
                Price, MOQ, lead time and Incoterms.{" "}
                <span className="fc-pending">Response-time commitment pending client confirmation.</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p className="fc-hint">
          Prefer email? Write to sales@aromem.com, or use the Contact us page — both reach the
          same desk.
        </p>
      </section>
    </FcShell>
  );
}
