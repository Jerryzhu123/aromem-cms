import type { Metadata } from "next";
import DynamicContact from "@/components/DynamicContact";
import QuoteForm from "@/components/QuoteForm";
import { CONTACT } from "@/data/site-zh";

export const metadata: Metadata = {
  title: "联系我们",
  description: CONTACT.intro,
  alternates: { canonical: "/zh/contact" },
};

/** 联系我们（中文）：定位横幅 + 联系方式（后台维护）+ 询盘表单 */
export default function ZhContactPage() {
  return (
    <>
      <div className="subhero">
        <div className="wrap">
          <div className="eyebrow">{CONTACT.eyebrow}</div>
          <h1>{CONTACT.title}</h1>
          <p>{CONTACT.intro}</p>
        </div>
      </div>

      <section className="section">
        <div className="wrap split start">
          <div>
            <h2>{CONTACT.heading}</h2>
            <p style={{ color: "var(--muted)" }}>{CONTACT.help}</p>
            {/* 联系方式：ADP 后台回填后自动显示，拉不到则整块不渲染 */}
            <DynamicContact />
          </div>
          <QuoteForm locale="zh" />
        </div>
      </section>
    </>
  );
}
