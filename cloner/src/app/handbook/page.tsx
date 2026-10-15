import type { Metadata } from "next";
import FcShell from "@/components/products/FcShell";
import { fcAlternates } from "@/lib/fcSeo";
import { contentApi } from "@/services/cms/api";

export const metadata: Metadata = {
  title: "Downloads | SURMEM",
  description:
    "Product brochures, datasheets and certificates for SURMEM filter cartridges, filter housings and RO membrane elements — listed with category, file size and a direct download link.",
  alternates: fcAlternates("en", "/handbook"),
};

/** 人类可读的文件大小，取不到就留空。 */
function formatSize(bytes: number | null): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * 英文站下载中心。
 *
 * 源站英文站没有这一页（旧站 /en 下无下载栏目），所以中文的 /handbook 是克隆页、
 * 英文这边改成直接吃后台资料接口（locale=en-US）：标题、分类、大小、下载链接都是后台维护，
 * 后台上传英文规格书后这里自动出现，不需要改代码。
 */
export default async function HandbookPage() {
  const docs = await contentApi.downloads("en").catch(() => null);
  const list = docs ?? [];

  return (
    <FcShell
      bannerTitle="Downloads"
      notice="Documents are added as product data is confirmed. If you cannot find the datasheet you need, ask us and we send it the same working day."
      crumbs={[
        { text: "Home", href: "/" },
        { text: "Downloads", href: "/handbook" },
      ]}
    >
      <section className="fc-section">
        <h2>Product documents</h2>
        <p className="fc-lede">
          Brochures, datasheets and certificates — the same revisions we attach to quotations,
          so the numbers on the page and in the PDF always match.
        </p>

        {list.length ? (
          <ul className="fc-docs">
            {list.map((doc) => (
              <li key={doc.id}>
                <span className="fc-doc-type">{doc.category}</span>
                <span>{doc.title}</span>
                <span className="fc-doc-size">{formatSize(doc.fileSizeBytes)}</span>
                <a className="fc-btn fc-btn-ghost" href={doc.fileUrl}>
                  Download (PDF)
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="fc-empty">
            No documents published yet — tell us the model or the part number you are replacing
            and we send the document directly.
          </div>
        )}
      </section>

      <section className="fc-section">
        <h2>Cannot find your model?</h2>
        <p className="fc-lede">
          Send the part number you run today. We confirm the replacement, then send the matching
          datasheet, drawing and certificate together with the quotation.
        </p>
        <div className="fc-cta-bar">
          <span className="fc-cta-text">Need a datasheet or a sample for a specific model?</span>
          <div className="fc-cta-actions">
            <a className="fc-btn" href="/request-a-quote">
              Request a quote
            </a>
            <a className="fc-btn fc-btn-ghost" href="/request-a-sample">
              Request a sample
            </a>
          </div>
        </div>
      </section>
    </FcShell>
  );
}
