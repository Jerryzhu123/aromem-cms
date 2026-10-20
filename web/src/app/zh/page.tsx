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
} from "@/data/site-zh";

export const metadata: Metadata = {
  title: "工业过滤与膜解决方案",
  description: HOME_HERO.text,
  alternates: { canonical: "/zh" },
};

/** 首页（中文）：英雄区 + 产品组合 + 合作伙伴价值 + 询盘引导 */
export default function ZhHomePage() {
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
          <div className="kicker">产品实拍</div>
          <h2>真实产品照片，不是素材图</h2>
          <p className="intro">
            照片来自我们的过滤产品供应体系。目前尚未与具体型号建立对应关系，
            请在报价确认时与我们核对确切产品。
          </p>
          <div className="photo-strip">
            {GALLERY_HIGHLIGHTS.map((file) => (
              <figure key={file}>
                <img
                  src={`/gallery/${file}`}
                  alt="工业滤芯实拍照片"
                  loading="lazy"
                  width={420}
                  height={280}
                />
              </figure>
            ))}
          </div>
          <Link href="/zh/gallery" className="link">
            查看产品实拍图库 →
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
            <Link href="/zh/contact" className="btn">
              获取报价 →
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
