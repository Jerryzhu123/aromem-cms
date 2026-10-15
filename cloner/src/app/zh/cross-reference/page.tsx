import type { Metadata } from "next";
import { fcAlternates } from "@/lib/fcSeo";
import FcShell from "@/components/products/FcShell";
import CrossReferenceTool from "@/components/products/CrossReferenceTool";
import { FC_COMPATIBLE_BRANDS, FC_CROSS_REFERENCE } from "@/data/filterCartridges";
import { quoteHref } from "@/lib/fcLinks";

const LOCALE = "zh" as const;

export const metadata: Metadata = {
  title: "型号对照——找到苏瑞膜对应型号 | 苏州苏瑞膜 SURMEM",
  description:
    "输入竞品或苏瑞膜型号，查找对应的工业滤芯：结果会标明关系类型（直接替代 / 兼容 / 规格相近）并链接到型号页与规格书。",
  alternates: fcAlternates("zh", "/zh/cross-reference"),
};

const STEPS = [
  {
    title: "1. 输入你现在在用的型号",
    body: "大小写、空格与连字符都会忽略，可以直接从采购单里粘贴。",
  },
  {
    title: "2. 看关系类型",
    body: "每条结果都标了直接替代 / 兼容 / 规格相近。无法确认的宁可不列，不猜。",
  },
  {
    title: "3. 直接报价或要样品",
    body: "打开型号页看完整规格与规格书，一键询价或申请样品。",
  },
];

export default function CrossReferencePageZh() {
  return (
    <FcShell
      locale={LOCALE}
      bannerTitle="型号对照"
      crumbs={[
        { text: "首页", href: "/zh" },
        { text: "产品中心", href: "/zh/products?id=22" },
        { text: "型号对照", href: null },
      ]}
    >
      <div className="fc-head">
        <h1>找到苏瑞膜对应型号</h1>
        <p className="fc-lede">
          输入竞品型号（或我们自己的型号）查出对应的苏瑞膜工业滤芯。对照表是逐条校对的，
          没收录的由出口部人工帮你对照，不会给你一个“凭感觉”的答案。
        </p>
      </div>

      <CrossReferenceTool
        rows={FC_CROSS_REFERENCE}
        brands={FC_COMPATIBLE_BRANDS}
        locale={LOCALE}
      />

      <section className="fc-section" id="fc-how">
        <h2>对照是怎么做的</h2>
        <div className="fc-grid">
          {STEPS.map((step) => (
            <article className="fc-card" key={step.title}>
              <div className="fc-card-body">
                <h3 className="fc-card-title">{step.title}</h3>
                <p className="fc-card-meta" style={{ margin: 0 }}>
                  {step.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="fc-section" id="fc-manual">
        <h2>表里还没收录？</h2>
        <p className="fc-lede">
          把型号、所在滤壳（能附照片或图纸更好）发给我们，我们回复最接近的型号以及差异所在——
          长度、端盖、滤材与过滤精度。
        </p>
        <a className="fc-btn" href={quoteHref(LOCALE)}>
          发送型号给工程师
        </a>
      </section>
    </FcShell>
  );
}
