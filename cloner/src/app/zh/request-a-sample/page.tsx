import type { Metadata } from "next";
import { fcAlternates } from "@/lib/fcSeo";
import FcShell from "@/components/products/FcShell";
import QuoteForm from "@/components/products/QuoteForm";

export const metadata: Metadata = {
  title: "申请样品——工业滤芯 | 苏州苏瑞膜 SURMEM",
  description:
    "下单前先拿样品验证适配性、过滤精度与端盖形式。留下型号与滤壳信息，我们一并确认样品条款与货期。",
  alternates: fcAlternates("zh", "/zh/request-a-sample"),
};

export default function RequestSamplePageZh() {
  return (
    <FcShell
      locale="zh"
      bannerTitle="申请样品"
      crumbs={[
        { text: "首页", href: "/zh" },
        { text: "产品中心", href: "/zh/products?id=22" },
        { text: "申请样品", href: null },
      ]}
    >
      <div className="fc-head">
        <h1>申请样品</h1>
        <p className="fc-lede">
          样品用于批量下单前的适配与性能验证。告诉我们型号、所配滤壳与应用场景，
          我们连同样品条款一起回复。
        </p>
      </div>

      <QuoteForm requestType="sample" locale="zh" />

      <section className="fc-section" id="fc-sample-notes" style={{ marginTop: 34 }}>
        <h2>样品条款</h2>
        <table className="fc-spec">
          <tbody>
            <tr>
              <th scope="row">样品费用</th>
              <td className="fc-pending">待客户确认（免费还是收费）。</td>
            </tr>
            <tr>
              <th scope="row">运费</th>
              <td className="fc-pending">待客户确认（客户承担还是苏瑞膜承担）。</td>
            </tr>
            <tr>
              <th scope="row">单客户数量上限</th>
              <td className="fc-pending">待客户确认。</td>
            </tr>
            <tr>
              <th scope="row">典型用途</th>
              <td>在真实滤壳上验证端盖适配、过滤精度与滤材兼容性，再下批量单。</td>
            </tr>
          </tbody>
        </table>
        <p className="fc-hint">
          经销商：顺带告知月用量，样品条款通常与首单报价一并商定。
        </p>
      </section>
    </FcShell>
  );
}
