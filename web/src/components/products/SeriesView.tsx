/**
 * 系列页视图（系列下的型号清单）。
 *
 * 英文站 /products/[series] 与中文站 /zh/products/[series] 共用本视图，
 * 差异只在 locale：文案、型号名称、规格摘要、URL 前缀。
 *
 * 服务端组件：静态导出时直接渲染成 HTML，型号卡片含完整参数文本，
 * 不依赖任何客户端请求（搜索引擎与禁用 JS 的用户都能看到内容）。
 */
import Link from "next/link";
import {
  type CatalogProduct,
  type CatalogSeries,
  type Locale,
  pick,
} from "@/data/catalog";

const COPY = {
  en: {
    products: "Products",
    count: (n: number) => `${n} model${n > 1 ? "s" : ""} in this series`,
    detail: "View details",
    quote: "Request a Quote",
    notice:
      "Model references and specifications are for initial catalog planning and require supplier confirmation before quotation. No stock, OEM authorization, certification or interchangeability is implied.",
    seriesLabel: "Product series",
    compare: "Compare specifications",
    selection: "Membrane selection guide",
    emptyTitle: "Model references are being compiled",
    emptyBody:
      "This series is part of our range, but its model list is still being consolidated. Send us the required dimensions or a sample part number and we will reply with available options.",
    emptyCta: "Ask about this series",
  },
  zh: {
    products: "产品中心",
    count: (n: number) => `本系列共 ${n} 个型号`,
    detail: "查看详情",
    quote: "询价",
    notice:
      "型号与规格仅供初步选型参考，报价前须经供应商确认。不构成现货、OEM 授权、认证或互换性承诺。",
    seriesLabel: "产品系列",
    compare: "参数对比表",
    selection: "选型引导",
    emptyTitle: "型号资料整理中",
    emptyBody:
      "该系列属于我们的供货范围，型号清单仍在汇总。把所需尺寸或已有型号发给我们，我们会回复可选方案。",
    emptyCta: "咨询该系列",
  },
} as const;

export default function SeriesView({
  series,
  products,
  locale,
}: {
  series: CatalogSeries;
  products: CatalogProduct[];
  locale: Locale;
}) {
  const t = COPY[locale];
  const base = locale === "zh" ? "/zh" : "";

  return (
    <>
      <div className="subhero">
        <div className="wrap">
          <div className="eyebrow">
            {t.seriesLabel} · {pick(series.name, locale)}
          </div>
          <h1>{pick(series.name, locale)}</h1>
          <p>{pick(series.tagline, locale)}</p>
        </div>
      </div>

      <section className="section">
        <div className="wrap">
          <nav className="crumb" aria-label="breadcrumb">
            <Link href={`${base}/products`}>{t.products}</Link>
            <span>/</span>
            <span>{pick(series.name, locale)}</span>
          </nav>

          {products.length > 0 ? (
            <>
              <p className="series-count">{t.count(products.length)}</p>

              <div className="grid">
                {products.map((product) => (
                  <div className="card" key={product.slug}>
                    <div className={`art${product.kind === "ro" ? " ro" : ""}`} />
                    <div className="card-body">
                      <span className="tag">{product.model}</span>
                      <h3>{pick(product.name, locale)}</h3>
                      <p>{pick(product.spec, locale)}</p>
                      <Link
                        className="link"
                        href={`${base}/products/${series.slug}/${product.slug}`}
                      >
                        {t.detail} →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* 新增品类先上格子、型号清单后补：这里给出可用的下一步，不留空白页 */
            <div className="series-empty">
              <h2>{t.emptyTitle}</h2>
              <p>{t.emptyBody}</p>
              <Link className="btn" href={`${base}/contact`}>
                {t.emptyCta} →
              </Link>
            </div>
          )}

          <p className="notice" style={{ marginTop: 32 }}>
            {t.notice}
          </p>

          <div className="actions" style={{ marginTop: 26 }}>
            <Link className="btn" href={`${base}/contact`}>
              {t.quote} →
            </Link>
            {series.kind === "ro" && (
              <>
                <Link
                  className="btn outline"
                  href={`${base}/ro-comparison`}
                  style={{ marginLeft: 12 }}
                >
                  {t.compare}
                </Link>
                <Link
                  className="btn outline"
                  href={`${base}/ro-selection-guide`}
                  style={{ marginLeft: 12 }}
                >
                  {t.selection}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
