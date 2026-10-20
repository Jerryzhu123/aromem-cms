/**
 * 型号详情视图。
 *
 * 数据全部来自 src/data/catalog.ts（静态导出在构建期渲染成 HTML），
 * 不使用客户端请求：型号参数属于必须稳定、可审计的内容，后台随手改
 * 反而带来合规风险，因此保持构建期固化。
 *
 * 合规要求（来自客户交付包 SURMEM_V19，不得删改）：
 * - verification 原文必须显示，说明哪些特征已核实、哪些还需数据表；
 * - 底部必须保留「不构成现货/授权/认证/性能保证」的免责声明；
 * - 产品照尚未逐型号核实，页面如实标注，不用无关照片冒充。
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
    specs: "Reference specifications",
    model: "Model",
    group: "Product group",
    spec: "Reference specification",
    source: "Manufacturer reference",
    sourceLink: "Supplier page ↗",
    photo: "Product photo",
    photoPending:
      "Photo pending model verification. The current gallery photos are not matched to this model, so none is shown here.",
    review: "Technical review",
    verification: "Verification status",
    applications: "Application",
    quoteList: "Information to include in your inquiry",
    quote: "Request Specification & Quote",
    browse: "Browse other models in this series",
    disclaimer:
      "Supplier reference only. No stock, OEM authorization, certification, interchangeability or performance guarantee is implied. Confirm the latest datasheet before publishing or quoting.",
  },
  zh: {
    products: "产品中心",
    specs: "参考规格",
    model: "型号",
    group: "归类",
    spec: "参考规格",
    source: "厂家参考来源",
    sourceLink: "厂家页面 ↗",
    photo: "产品照片",
    photoPending:
      "照片待型号核实。现有图库照片尚未与本品匹配，因此此处不展示。",
    review: "技术复核",
    verification: "核实状态",
    applications: "应用",
    quoteList: "询价需提供的信息",
    quote: "索取规格与报价",
    browse: "浏览本系列其他型号",
    disclaimer:
      "仅供供应商参考。不构成现货、OEM 授权、认证、互换性或性能保证。发布或报价前须确认最新数据表。",
  },
} as const;

export default function ProductView({
  series,
  product,
  locale,
}: {
  series: CatalogSeries;
  product: CatalogProduct;
  locale: Locale;
}) {
  const t = COPY[locale];
  const base = locale === "zh" ? "/zh" : "";
  const seriesHref = `${base}/products/${series.slug}`;
  const quoteHref = `${base}/contact?series=${encodeURIComponent(
    series.slug,
  )}&model=${encodeURIComponent(product.slug)}`;

  return (
    <>
      <div className="subhero">
        <div className="wrap">
          <div className="eyebrow">
            {pick(product.category, locale)} · {product.model}
          </div>
          <h1>{pick(product.name, locale)}</h1>
          <p>{pick(product.summary, locale)}</p>
        </div>
      </div>

      <section className="section">
        <div className="wrap">
          <nav className="crumb" aria-label="breadcrumb">
            <Link href={`${base}/products`}>{t.products}</Link>
            <span>/</span>
            <Link href={seriesHref}>{pick(series.name, locale)}</Link>
            <span>/</span>
            <span>{product.model}</span>
          </nav>

          <div className="split start detail-split">
            <div>
              <h2>{t.specs}</h2>
              <table className="spec-table">
                <tbody>
                  <tr>
                    <th scope="row">{t.model}</th>
                    <td>{product.model}</td>
                  </tr>
                  <tr>
                    <th scope="row">{t.group}</th>
                    <td>{pick(product.category, locale)}</td>
                  </tr>
                  <tr>
                    <th scope="row">{t.spec}</th>
                    <td>{pick(product.spec, locale)}</td>
                  </tr>
                  <tr>
                    <th scope="row">{t.photo}</th>
                    {product.photo ? (
                      <td>
                        {/* 原图直出：产品图需要保持原始像素，不走优化器 */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className="spec-photo"
                          src={product.photo}
                          alt={pick(product.name, locale)}
                          loading="lazy"
                        />
                      </td>
                    ) : (
                      <td className="spec-pending">{t.photoPending}</td>
                    )}
                  </tr>
                  {product.sourceUrl && (
                    <tr>
                      <th scope="row">{t.source}</th>
                      <td>
                        <a
                          href={product.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                        >
                          {t.sourceLink}
                        </a>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <h2>{t.review}</h2>
              <p>{pick(product.technicalNote, locale)}</p>

              <h2>{t.verification}</h2>
              <p className="notice">{pick(product.verification, locale)}</p>

              <h2>{t.applications}</h2>
              <p>{pick(product.application, locale)}</p>
            </div>

            <div>
              <div className="panel">
                <h3>{t.quoteList}</h3>
                <ul className="check">
                  {product.checklist[locale].map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="actions" style={{ marginTop: 24 }}>
                  <Link className="btn" href={quoteHref}>
                    {t.quote} →
                  </Link>
                </div>
              </div>

              <p className="notice" style={{ marginTop: 20 }}>
                {t.disclaimer}
              </p>

              <p style={{ marginTop: 20 }}>
                <Link className="link" href={seriesHref}>
                  ← {t.browse}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
