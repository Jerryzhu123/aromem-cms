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

const LOCALE = "zh" as const;

/**
 * RO 膜与组件（中文站）—— 第二产品板块落地页。
 *
 * 分层：先按类型分（BWRO / ULP / LP / SWRO），再在规格层用 4040 / 8040 筛选与标注。
 * 客户素材未到时，参数一律走 pending 占位，不编造任何 SURMEM 参数。
 */
export const metadata: Metadata = {
  title: "RO 膜与组件 | 苏州苏瑞膜 SURMEM",
  description:
    "苦咸水（BWRO）、超低压（ULP）、低压（LP）与海水淡化（SWRO）反渗透膜元件，4040 与 8040 规格，以及膜壳与膜组件。先按类型选型，再按规格筛选，可提交询价。",
  alternates: fcAlternates(LOCALE, "/zh/products/ro-membranes"),
};

const STEPS = [
  {
    title: "1. 先报水质",
    body: "进水 TDS、温度、产水量要求与回收率目标。苦咸水与海水选型完全是两条路。",
  },
  {
    title: "2. 再定规格",
    body: "4040 还是 8040，取决于现有膜壳与系统产水量；更换场合直接报现有型号。",
  },
  {
    title: "3. 拿报价与规格书",
    body: "价格、起订量与货期按型号单独报；规格书与测试条件随报价一并给。",
  },
];

export default function RoMembranesPageZh() {
  const pending = roPending(LOCALE);

  return (
    <FcShell
      locale={LOCALE}
      bannerTitle="RO 膜与组件"
      crumbs={[
        { text: "首页", href: "/zh" },
        { text: "产品中心", href: "/zh/products?id=22" },
        { text: "RO 膜与组件", href: null },
      ]}
    >
      <div className="fc-head">
        <h1>RO 膜与组件</h1>
        <p className="fc-lede">
          先按类型选：苦咸水、超低压、低压、海水淡化；再用 4040 / 8040 规格筛选与标注。膜壳与膜组件同属本板块。
        </p>
        <div className="fc-chips">
          <span className="fc-chip">BWRO · ULP · LP · SWRO</span>
          <span className="fc-chip">4040 / 8040</span>
          <span className="fc-chip">膜壳与组件</span>
          <span className="fc-chip">逐型号规格书</span>
        </div>
      </div>

      <div className="fc-cta-bar">
        <span className="fc-cta-text">
          <b>不确定选哪个类型？</b> 把水质与现有型号发过来，我们帮你对。
        </span>
        <span className="fc-cta-actions">
          <a className="fc-btn" href="/zh/request-a-quote">
            获取报价
          </a>
        </span>
      </div>

      <section className="fc-section" id="ro-types">
        <h2>按类型浏览</h2>
        <p className="fc-lede">
          四个类型对应四种水质与能耗取向；下一页（型号层）才会出现具体型号与参数。
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
                    {t.pressure}（行业参考，非苏瑞膜产品参数）
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
        <h2>规格表要看哪几项</h2>
        <p className="fc-lede">
          下面十项是行业 RO 页面通用的表头，少一项买家就要追问。型号数据与测试条件由客户提供后填入；未提供的位一律标「待补」，不填假数。
        </p>
        <table className="fc-spec">
          <tbody>
            {RO_SPEC_FIELDS.map((field) => (
              <tr key={field.key}>
                <th scope="row">{field.labelZh}</th>
                <td>{field.noteZh}</td>
              </tr>
            ))}
            <tr>
              <th scope="row">型号数据</th>
              <td className="fc-pending">{pending}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="fc-section" id="ro-components">
        <h2>膜壳与组件</h2>
        <p className="fc-lede">
          本板块里的「组件」专指膜壳（压力容器）与配套件，与滤芯板块的通用配件不是同一件事。
        </p>
        <table className="fc-spec">
          <tbody>
            {RO_COMPONENT_SPECS.map((spec) => (
              <tr key={spec.key}>
                <th scope="row">{spec.labelZh}</th>
                <td>{spec.noteZh}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="fc-section" id="ro-how">
        <h2>怎么选</h2>
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
        <h2>把水质与规格发给我们</h2>
        <p className="fc-lede">
          报上进水 TDS、产水量要求与现有膜壳规格，我们按型号回复报价、货期与测试条件。
        </p>
        <QuoteForm requestType="quote" locale={LOCALE} variant="compact" />
      </section>
    </FcShell>
  );
}
