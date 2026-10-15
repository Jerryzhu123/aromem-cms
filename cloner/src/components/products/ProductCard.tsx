import { FC_PLACEHOLDER_IMAGE, productText, type FcProduct } from "@/data/filterCartridges";
import { fcBlocks } from "@/data/fcBlocks";
import { fcText, isPending, type FcLocale } from "@/data/fcText";
import { pickDatasheet } from "@/lib/fcDetail";
import { crossRefHref, productHref, quoteHref, sampleHref } from "@/lib/fcLinks";

/** 兼容旧引用：链接生成器已移到 @/lib/fcLinks。 */
export { productHref, quoteHref, sampleHref, crossRefHref } from "@/lib/fcLinks";

function Meta({ label, value, pending }: { label: string; value: string; pending: string }) {
  const isBlank = isPending(value);
  return (
    <>
      <dt>{label}</dt>
      <dd className={isBlank ? "fc-pending" : undefined}>{isBlank ? pending : value}</dd>
    </>
  );
}

/**
 * 系列列表页的产品卡片（中英文共用）。
 *
 * 设计依据（方案第 5.2 节）：把可决策字段前置到列表层——
 * 型号 / micron / 尺寸 / 端盖 / 兼容型号摘要，并给出规格书与询价入口，减少点击层级。
 */
export default function ProductCard({
  product,
  locale = "en",
}: {
  product: FcProduct;
  locale?: FcLocale;
}) {
  const t = fcText(locale);
  const b = fcBlocks(locale);
  const pt = productText(product, locale);
  const href = productHref(product.seriesSlug, product.slug, locale);
  const image = product.gallery[0] || FC_PLACEHOLDER_IMAGE;
  const compatibleCount = product.compatibleModels.length;
  const datasheet = pickDatasheet(product.documents, locale);

  return (
    <article className="fc-card">
      <a className="fc-card-media" href={href} aria-label={product.model}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={product.model} loading="lazy" />
      </a>
      <div className="fc-card-body">
        <h3 className="fc-card-title">
          <a href={href}>{product.model}</a>
        </h3>
        <p className="fc-card-sub">{pt.title}</p>
        <dl className="fc-card-meta">
          <Meta label={t.card.micronAbs} value={product.micronAbsolute} pending={t.pending} />
          <Meta
            label={t.card.length}
            value={
              isPending(product.overallLength)
                ? ""
                : `${product.overallLength} ${pt.lengthUnit}`
            }
            pending={t.pending}
          />
          <Meta
            label={t.card.od}
            value={
              isPending(product.outsideDiameter)
                ? ""
                : `${product.outsideDiameter} ${pt.diameterUnit}`
            }
            pending={t.pending}
          />
          <Meta label={t.card.endCap} value={product.endCap} pending={t.pending} />
        </dl>

        <p className="fc-card-meta" style={{ margin: "0 0 10px" }}>
          {compatibleCount > 0 ? (
            <>
              <b>{t.card.crossRefPrefix}</b> {t.card.crossRefCount(compatibleCount)}{" "}
              <a href={crossRefHref(locale, product.model)}>{t.crossRefCheckTool}</a>
            </>
          ) : (
            <span className="fc-pending">{t.card.crossRefPending}</span>
          )}
        </p>

        {/* 规格书入口：文件未上传时给占位态，不做死链 */}
        {datasheet ? (
          datasheet.fileUrl ? (
            <a className="fc-doc-link" href={datasheet.fileUrl}>
              <span className="fc-doc-badge">PDF</span>
              {b.datasheet.download}
            </a>
          ) : (
            <span className="fc-doc-link is-pending">
              <span className="fc-doc-badge">PDF</span>
              {b.datasheet.pending}
            </span>
          )
        ) : null}

        <div className="fc-card-actions">
          <a
            className="fc-btn"
            href={quoteHref(locale, {
              part: product.model,
              series: product.seriesSlug,
              model: product.slug,
            })}
          >
            {t.requestQuote}
          </a>
          <a className="fc-btn fc-btn-ghost" href={sampleHref(locale, { part: product.model })}>
            {t.sample}
          </a>
          <a className="fc-btn fc-btn-ghost" href={href}>
            {t.details}
          </a>
        </div>
      </div>
    </article>
  );
}
