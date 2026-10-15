import { documentTitle, type FcDocument } from "@/data/filterCartridges";
import { fcText, type FcLocale } from "@/data/fcText";

function formatSize(bytes: number | null): string | null {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * 文档下载区（规格书 / 图纸 / 证书），中英文共用。
 *
 * 沿用中文站 /handbook 下载中心的「名称 / 分类 / 大小 / 下载」行式布局，
 * 并额外带上语言与版本，便于海外经销商核对版本。
 */
export default function DocumentList({
  documents,
  locale = "en",
}: {
  documents: FcDocument[];
  locale?: FcLocale;
}) {
  const t = fcText(locale).docs;

  if (!documents.length) {
    return <div className="fc-empty">{t.empty}</div>;
  }

  return (
    <ul className="fc-docs">
      {documents.map((doc, index) => {
        const typeLabel = t.types[doc.docType] ?? doc.docType;
        return (
          <li key={`${doc.docType}-${index}`}>
            <span className="fc-doc-type">{typeLabel}</span>
            <span>
              {documentTitle(doc, locale)}
              {doc.lang ? (
                <span className="fc-doc-size">
                  {t.lang}: {doc.lang}
                </span>
              ) : null}
              {doc.revision ? (
                <span className="fc-doc-size">
                  {t.rev}: {doc.revision}
                </span>
              ) : null}
            </span>
            <span className="fc-doc-size">{formatSize(doc.fileSizeBytes) ?? ""}</span>
            {doc.fileUrl ? (
              <a className="fc-btn fc-btn-ghost" href={doc.fileUrl}>
                {t.download} {typeLabel} (PDF)
              </a>
            ) : (
              <span className="fc-pending">{t.pendingFile}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
