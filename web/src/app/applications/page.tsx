import type { Metadata } from "next";
import { APPLICATIONS } from "@/data/site";

export const metadata: Metadata = {
  title: "Applications",
  description: APPLICATIONS.intro,
};

/** 应用行业：定位横幅 + 行业卡片 + 合规提示 */
export default function ApplicationsPage() {
  return (
    <>
      <div className="subhero">
        <div className="wrap">
          <div className="eyebrow">{APPLICATIONS.eyebrow}</div>
          <h1>{APPLICATIONS.title}</h1>
          <p>{APPLICATIONS.intro}</p>
        </div>
      </div>

      <section className="section">
        <div className="wrap">
          <h2>{APPLICATIONS.heading}</h2>
          <div className="grid" style={{ margin: "36px 0 32px" }}>
            {APPLICATIONS.cards.map((card) => (
              <div className="card" key={card.title}>
                <div className="card-body">
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="notice">{APPLICATIONS.notice}</p>
        </div>
      </section>
    </>
  );
}
