import type { Metadata } from "next";
import Link from "next/link";
import { OEM } from "@/data/site";

export const metadata: Metadata = {
  title: "OEM & Private Label",
  description: OEM.intro,
};

/** OEM 及品牌定制：定位横幅 + 私标选项清单 + 询盘引导 */
export default function OemPage() {
  return (
    <>
      <div className="subhero">
        <div className="wrap">
          <div className="eyebrow">{OEM.eyebrow}</div>
          <h1>{OEM.title}</h1>
          <p>{OEM.intro}</p>
        </div>
      </div>

      <section className="section">
        <div className="wrap split">
          <div>
            <div className="kicker">Branding Support</div>
            <h2>{OEM.heading}</h2>
            <p>{OEM.body}</p>
            <ul className="check" style={{ marginBottom: 28 }}>
              {OEM.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <Link href="/contact" className="btn">
              {OEM.cta} →
            </Link>
          </div>
          <div
            className="art custom"
            style={{ height: 340, borderRadius: 8 }}
            aria-hidden
          />
        </div>
      </section>

      {/* 定制范围三卡 + 报价依赖声明 */}
      <section className="section soft">
        <div className="wrap">
          <div className="grid">
            {OEM.cards.map((card) => (
              <div className="card" key={card.title}>
                <div className="card-body">
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="disclaimer">{OEM.disclaimer}</p>
        </div>
      </section>
    </>
  );
}
