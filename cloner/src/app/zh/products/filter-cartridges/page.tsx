import type { Metadata } from "next";
import FcShell from "@/components/products/FcShell";
import QuoteForm from "@/components/products/QuoteForm";
import { FC_PLACEHOLDER_IMAGE, seriesText } from "@/data/filterCartridges";
import { fcBlocks, fcCapabilityRows } from "@/data/fcBlocks";
import { crossRefHref, quoteHref, seriesHref } from "@/lib/fcLinks";
import { fcAlternates } from "@/lib/fcSeo";
import { getFcSeries } from "@/services/cms/filterCartridges";

const LOCALE = "zh" as const;
const B = fcBlocks(LOCALE);

export const metadata: Metadata = {
  title: "滤芯与滤芯壳体 | 苏州苏瑞膜 SURMEM",
  description:
    "大流量、折叠、PP 熔喷、线绕与替代兼容滤芯，以及配套的单支 / 多支 / 大流量滤芯壳体。按过滤精度、长度、外径、滤材、端盖与流量区间选型，可下载规格书、可用原厂型号做对照，或直接提交询价。",
  alternates: fcAlternates(LOCALE, "/zh/products/filter-cartridges"),
};

const STEPS = [
  {
    title: "1. 先确认你现在用的是什么",
    body: "把原厂型号、照片或图纸发给我们。对照表里还没收录的，由人工逐项核对后回复。",
  },
  {
    title: "2. 核对精度、长度与端盖",
    body: "每个型号页都列出绝对/名义精度、尺寸、滤材、端盖形式与流量区间，避免先试再返工。",
  },
  {
    title: "3. 询价或先要样品",
    body: "价格、起订量与货期按型号单独报；样品政策随报价一起确认。",
  },
];

export default async function FilterCartridgesLandingPageZh() {
  const series = await getFcSeries();
  const live = series.filter((item) => !item.comingSoon);
  const planned = series.filter((item) => item.comingSoon);
  const capability = fcCapabilityRows(LOCALE);

  return (
    <FcShell
      locale={LOCALE}
      bannerTitle="滤芯与滤芯壳体"
      crumbs={[
        { text: "首页", href: "/zh" },
        { text: "产品中心", href: "/zh/products?id=22" },
        { text: "滤芯与滤芯壳体", href: null },
      ]}
    >
      <div className="fc-head">
        <h1>滤芯与滤芯壳体</h1>
        <p className="fc-lede">
          面向工业水处理与工艺过滤的滤芯与壳体：大流量、折叠、PP 熔喷、线绕、替代与兼容，以及配套单支 / 多支 / 大流量壳体。可按参数选型、可用原厂型号做对照、可下载规格书，也可直接叫我们报价。
        </p>
        <div className="fc-chips">
          <span className="fc-chip">绝对 / 名义精度</span>
          <span className="fc-chip">替代与兼容型号</span>
          <span className="fc-chip">逐型号规格书</span>
          <span className="fc-chip">出口单证支持</span>
        </div>
      </div>

      <div className="fc-cta-bar">
        <span className="fc-cta-text">
          <b>已经知道型号？</b> 一步完成对照，无需注册。
        </span>
        <span className="fc-cta-actions">
          <a className="fc-btn" href={crossRefHref(LOCALE)}>
            型号对照工具
          </a>
          <a className="fc-btn fc-btn-ghost" href={quoteHref(LOCALE)}>
            获取报价
          </a>
        </span>
      </div>

            <section className="fc-section" id="fc-series">
        <h2>按类别浏览</h2>
        {[
          { key: "cartridge", title: "滤芯", items: live.filter((i) => i.group !== "housing") },
          { key: "housing", title: "滤芯壳体", items: live.filter((i) => (i.group === "housing" || i.slug === "filter-housings")) },
        ].map((block) =>
          block.items.length ? (
            <div key={block.key} style={{ marginBottom: 22 }}>
              <h3 className="fc-card-title" style={{ margin: "0 0 10px" }}>
                {block.title}
              </h3>
              <div className="fc-grid">
                {block.items.map((item) => {
                  const st = seriesText(item, LOCALE);
                  return (
                    <article className="fc-card" key={item.slug}>
                      <a className="fc-card-media" href={seriesHref(item.slug, LOCALE)}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={FC_PLACEHOLDER_IMAGE} alt={st.name} />
                      </a>
                      <div className="fc-card-body">
                        <h3 className="fc-card-title">
                          <a href={seriesHref(item.slug, LOCALE)}>{st.name}</a>
                        </h3>
                        <p className="fc-card-meta">{st.tagline}</p>
                        <div className="fc-chips">
                          {st.facets.slice(0, 4).map((facet) => (
                            <span className="fc-chip" key={facet}>
                              {facet}
                            </span>
                          ))}
                        </div>
                        <div className="fc-card-actions">
                          <a className="fc-btn" href={seriesHref(item.slug, LOCALE)}>
                            进入系列
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null,
        )}
        {planned.length ? (
          <p className="fc-hint">
            预留系列位（结构占位，暂未建页）：{planned.map((i) => seriesText(i, LOCALE).name).join(" · ")}
          </p>
        ) : null}
      </section>

      {/* 新增区块 1：产品线能力 */}
      <section className="fc-section" id="fc-capability">
        <h2>{B.capability.title}</h2>
        <p className="fc-lede">{B.capability.intro}</p>
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
        <h2>如何选型</h2>
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

      {/* 新增区块 2：为什么选苏瑞膜 */}
      <section className="fc-section" id="fc-why">
        <h2>{B.why.title}</h2>
        <div className="fc-grid fc-grid-4">
          {B.why.items.map((item) => (
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
        <h2>资料与支持</h2>
        <table className="fc-spec">
          <tbody>
            <tr>
              <th scope="row">规格书</th>
              <td>每个型号一份 PDF，在型号页直接下载（含版本日期）。</td>
            </tr>
            <tr>
              <th scope="row">图纸</th>
              <td>随报价一并提供。</td>
            </tr>
            <tr>
              <th scope="row">认证</th>
              <td className="fc-pending">暂未公布——证书待客户提供。</td>
            </tr>
            <tr>
              <th scope="row">样品政策</th>
              <td className="fc-pending">待客户确认。</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 新增区块 3：底部询价区（内嵌紧凑表单） */}
      <section className="fc-section fc-inquiry" id="fc-inquiry">
        <h2>{B.inquiry.title}</h2>
        <p className="fc-lede">{B.inquiry.intro}</p>
        <QuoteForm requestType="quote" locale={LOCALE} variant="compact" />
      </section>
    </FcShell>
  );
}
