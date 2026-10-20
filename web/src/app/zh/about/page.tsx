import type { Metadata } from "next";
import Link from "next/link";
import { ABOUT } from "@/data/site-zh";

export const metadata: Metadata = {
  title: "关于我们",
  description: ABOUT.intro,
  alternates: { canonical: "/zh/about" },
};

/** 关于我们（中文）：定位横幅 + 介绍 + 客户关注点面板 + 采购需求 + 能力卡 + 合作方声明 + 引导 */
export default function ZhAboutPage() {
  return (
    <>
      <div className="subhero">
        <div className="wrap">
          <div className="eyebrow">{ABOUT.eyebrow}</div>
          <h1>{ABOUT.title}</h1>
          <p>{ABOUT.intro}</p>
        </div>
      </div>

      <section className="section">
        <div className="wrap split">
          <div>
            <div className="kicker">我们是谁</div>
            <h2>{ABOUT.heading}</h2>
            <p className="lead">{ABOUT.lead}</p>
            <p>{ABOUT.location}</p>
          </div>
          <div className="panel">
            <h3>{ABOUT.panelTitle}</h3>
            <ul className="check">
              {ABOUT.panelPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="wrap">
          <h2>{ABOUT.sourcingTitle}</h2>
          <p className="intro">{ABOUT.sourcingBody}</p>

          <h2>{ABOUT.strengthsTitle}</h2>
          <div className="strength-grid">
            {ABOUT.strengths.map((item) => (
              <div className="strength" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>

          <p className="disclaimer">{ABOUT.disclaimer}</p>
          <div className="actions">
            <Link className="btn" href={ABOUT.cta.href}>
              {ABOUT.cta.label} →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
