/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import HeroVisual from "@/components/HeroVisual";
import { GALLERY_HIGHLIGHTS } from "@/data/catalog";
import {
  HOME_HERO,
  HOME_INDUSTRIES,
  HOME_PARTNER,
  HOME_PORTFOLIO,
  HOME_SUPPORT,
} from "@/data/site";

export const metadata: Metadata = {
  title: "Industrial Filtration & Membrane Solutions",
  description: HOME_HERO.text,
};

/** 首页：英雄区 + 产品组合 + 合作伙伴价值 + 询盘引导 */
export default function HomePage() {
  return (
    <>
      {/* 英雄区 */}
      <section className="hero">
        <div className="wrap hero-inner">
          <div>
            <div className="eyebrow">{HOME_HERO.eyebrow}</div>
            <h1>{HOME_HERO.title}</h1>
            <p>{HOME_HERO.text}</p>
            <div className="actions">
              <Link href={HOME_HERO.primaryCta.href} className="btn">
                {HOME_HERO.primaryCta.label} →
              </Link>
              <Link href={HOME_HERO.secondaryCta.href} className="btn alt">
                {HOME_HERO.secondaryCta.label}
              </Link>
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* 产品组合 */}
      <section className="section">
        <div className="wrap">
          <div className="kicker">{HOME_PORTFOLIO.kicker}</div>
          <h2>{HOME_PORTFOLIO.title}</h2>
          <p className="intro">{HOME_PORTFOLIO.intro}</p>
          <div className="grid">
            {HOME_PORTFOLIO.cards.map((card) => (
              <div className="card" key={card.title}>
                <div className={`art ${card.art}`} />
                <div className="card-body">
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  <Link className="link" href={card.href}>
                    {card.cta} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 产品实拍（图库入口） */}
      <section className="section">
        <div className="wrap">
          <div className="kicker">Product photography</div>
          <h2>Real products, not stock images</h2>
          <p className="intro">
            Photographs from our filtration supply portfolio. Photos are not yet
            matched to specific model numbers — confirm the exact product with
            our team during quotation.
          </p>
          <div className="photo-strip">
            {GALLERY_HIGHLIGHTS.map((file) => (
              <figure key={file}>
                <img
                  src={`/gallery/${file}`}
                  alt="Industrial filter cartridge photograph"
                  loading="lazy"
                  width={420}
                  height={280}
                />
              </figure>
            ))}
          </div>
          <Link href="/gallery" className="link">
            View product photo gallery →
          </Link>
        </div>
      </section>

      {/* 四条支撑能力 */}
      <section className="section">
        <div className="wrap">
          <div className="kicker">{HOME_SUPPORT.kicker}</div>
          <h2>{HOME_SUPPORT.title}</h2>
          <div className="strength-grid">
            {HOME_SUPPORT.items.map((item) => (
              <div className="strength" key={item.num}>
                <div className="strength-num">{item.num}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 合作伙伴价值 */}
      <section className="section soft">
        <div className="wrap split">
          <div>
            <div className="kicker">{HOME_PARTNER.kicker}</div>
            <h2>{HOME_PARTNER.title}</h2>
            <p className="intro">{HOME_PARTNER.intro}</p>
            <Link href="/contact" className="btn">
              Request a Quote →
            </Link>
          </div>
          <div className="panel">
            <ul className="check">
              {HOME_PARTNER.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 行业条带 */}
      <section className="section">
        <div className="wrap">
          <div className="kicker">{HOME_INDUSTRIES.kicker}</div>
          <h2>{HOME_INDUSTRIES.title}</h2>
          <ul className="industry-strip">
            {HOME_INDUSTRIES.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link href={HOME_INDUSTRIES.cta.href} className="link">
            {HOME_INDUSTRIES.cta.label} →
          </Link>
        </div>
      </section>
    </>
  );
}
