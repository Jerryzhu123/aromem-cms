/**
 * RO 膜技术对比视图（/ro-comparison 与 /zh/ro-comparison 共用）。
 *
 * 三条纪律（来自客户交付包 V19，不得简化）：
 * 1. 每个系列测试条件不同，横向比 GPD 前必须先看 feed / pressure 两列；
 * 2. XLP-4040 的英文页与中文页数值不一致，页面必须显式标注，不能只选一个当真值；
 * 3. 所有数值都标为「厂家公布参考值」，不是 SURMEM 的性能承诺。
 */
import Link from "next/link";
import { type Locale, RO_COMPARISON } from "@/data/catalog";

const COPY = {
  en: {
    eyebrow: "RO membranes",
    title: "RO Membrane Technical Comparison",
    intro:
      "Manufacturer-published reference specifications for 10 industrial RO membrane models.",
    status:
      "Specification status: verified against the manufacturer's currently accessible English product pages. The latest brochure and the exact supplied revision still require cross-checking. Flow rates are nominal test values, not guaranteed field performance.",
    alertTitle: "Revision alert — XLP-4040",
    alert:
      "The manufacturer's English page lists 2,300 GPD and 98.5% stable rejection, while its Chinese XLP-4040 page lists 2,600 GPD and 99.2%. Do not treat either figure as a confirmed single-version specification until the supplied model revision is established.",
    th: {
      model: "Model",
      flow: "Flow (GPD)",
      stable: "Stable rejection",
      min: "Min. rejection",
      area: "Area (ft²)",
      test: "Test feed / pressure",
      source: "Source",
    },
    sourceLink: "Manufacturer specs ↗",
    shared:
      "Shared test conditions: 25 ± 2°C; pH 7.5–8.0; recovery 15 ± 1%; nominal flow variation ±15%. Feed concentration and pressure differ by series as shown above.",
    limits:
      "General limits for these listed series: maximum operating pressure 600 psi (4.14 MPa), maximum feed temperature 45°C, continuous operating pH 2–11, maximum SDI15 5. Always confirm the current datasheet and system design before ordering.",
    guide: "Get help selecting a membrane",
    quote: "Request a quote",
    detail: "Model details",
  },
  zh: {
    eyebrow: "反渗透膜",
    title: "RO 膜技术参数对比",
    intro: "10 款工业反渗透膜元件的厂家公布参考规格。",
    status:
      "规格状态：已对照厂家当前可访问的英文产品页核实。最新版手册与确切供货批次仍需复核。产水量为标称测试值，不构成现场性能保证。",
    alertTitle: "版本提示 — XLP-4040",
    alert:
      "厂家英文页标注 2,300 GPD、稳定脱盐率 98.5%；其中文 XLP-4040 页面标注 2,600 GPD、99.2%。在确认供货型号批次之前，任一组数值都不能当作唯一确认规格。",
    th: {
      model: "型号",
      flow: "产水量 (GPD)",
      stable: "稳定脱盐率",
      min: "最低脱盐率",
      area: "膜面积 (ft²)",
      test: "测试进液 / 压力",
      source: "来源",
    },
    sourceLink: "厂家参数 ↗",
    shared:
      "共用测试条件：25 ± 2°C；pH 7.5–8.0；回收率 15 ± 1%；标称产水量波动 ±15%。各系列进液浓度与压力不同，见上表。",
    limits:
      "上述系列通用限制：最高运行压力 600 psi（4.14 MPa），最高进液温度 45°C，连续运行 pH 2–11，最大 SDI15 为 5。下单前须确认现行数据表与系统设计。",
    guide: "需要选型建议",
    quote: "索取报价",
    detail: "型号详情",
  },
} as const;

export default function RoComparisonView({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const base = locale === "zh" ? "/zh" : "";

  return (
    <>
      <div className="subhero">
        <div className="wrap">
          <div className="eyebrow">{t.eyebrow}</div>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
        </div>
      </div>

      <section className="section">
        <div className="wrap">
          <p className="notice">{t.status}</p>

          <div className="alert-box">
            <strong>{t.alertTitle}</strong>
            <p>{t.alert}</p>
          </div>

          <div className="table-scroll">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>{t.th.model}</th>
                  <th>{t.th.flow}</th>
                  <th>{t.th.stable}</th>
                  <th>{t.th.min}</th>
                  <th>{t.th.area}</th>
                  <th>{t.th.test}</th>
                  <th>{t.th.source}</th>
                </tr>
              </thead>
              <tbody>
                {RO_COMPARISON.map((row) => (
                  <tr key={row.model}>
                    <th scope="row">
                      <Link className="link" href={`${base}/products/ro-membranes/${row.slug}`}>
                        {row.model}
                      </Link>
                    </th>
                    <td>{row.flowGpd.toLocaleString("en-US")}</td>
                    <td>{row.rejectionStable}%</td>
                    <td>{row.rejectionMin}%</td>
                    <td>{row.areaFt2}</td>
                    <td className="compare-test">
                      {row.testFeed} · {row.testPressure}
                    </td>
                    <td>
                      <a
                        href={row.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                      >
                        {t.sourceLink}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="notice" style={{ marginTop: 20 }}>
            {t.shared}
          </p>
          <p className="notice">{t.limits}</p>

          <div className="actions" style={{ marginTop: 26 }}>
            <Link className="btn" href={`${base}/ro-selection-guide`}>
              {t.guide} →
            </Link>
            <Link
              className="btn alt"
              href={`${base}/contact`}
              style={{ marginLeft: 12 }}
            >
              {t.quote}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
