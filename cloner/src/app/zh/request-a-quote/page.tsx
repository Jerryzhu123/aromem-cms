import type { Metadata } from "next";
import { fcAlternates } from "@/lib/fcSeo";
import FcShell from "@/components/products/FcShell";
import QuoteForm from "@/components/products/QuoteForm";

export const metadata: Metadata = {
  title: "获取报价——工业滤芯 | 苏州苏瑞膜 SURMEM",
  description:
    "留下型号、数量与目的港，出口部按型号回复价格、起订量与货期；也可直接发送原厂型号由我们做对照。",
  alternates: fcAlternates("zh", "/zh/request-a-quote"),
};

export default function RequestQuotePageZh() {
  return (
    <FcShell
      locale="zh"
      bannerTitle="获取报价"
      crumbs={[
        { text: "首页", href: "/zh" },
        { text: "产品中心", href: "/zh/products?id=22" },
        { text: "获取报价", href: null },
      ]}
    >
      <div className="fc-head">
        <h1>获取报价</h1>
        <p className="fc-lede">
          四个字段就能开始：姓名、公司、工作邮箱和型号。其余信息能让我们报得更快——
          经销商询价会优先转到出口部。
        </p>
      </div>

      <QuoteForm requestType="quote" locale="zh" />

      <section className="fc-section" id="fc-quote-notes" style={{ marginTop: 34 }}>
        <h2>提交之后会发生什么</h2>
        <table className="fc-spec">
          <tbody>
            <tr>
              <th scope="row">1. 收到确认</th>
              <td>我们先确认收到了型号，并指出缺少的信息。</td>
            </tr>
            <tr>
              <th scope="row">2. 对照与适配核对</th>
              <td>如果不是我们的型号，我们帮你对照，并告诉你规格差异在哪里。</td>
            </tr>
            <tr>
              <th scope="row">3. 报价</th>
              <td>
                价格、起订量、货期与贸易条款。{" "}
                <span className="fc-pending">响应时效承诺待客户确认。</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p className="fc-hint">
          习惯用邮件？发到 sales@aromem.com，或走「联系我们」页，都到同一个部门。
        </p>
      </section>
    </FcShell>
  );
}
