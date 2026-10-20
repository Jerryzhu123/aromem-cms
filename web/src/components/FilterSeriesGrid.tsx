"use client";

/**
 * 滤芯系列网格（Products 页主线「Industrial Filter Cartridges / 工业滤芯」）。
 *
 * fetch-with-fallback 策略：
 * - 首屏渲染传入的内置默认卡（静态导出直接进 HTML，保证 SEO 与后端
 *   不可用时的兜底展示）；
 * - 水合后拉 GET /api/v1/fc-series（按 locale 取 en-US / zh-CN），拉到
 *   非空列表则整组覆盖：系列名 / 简介 / 特性点按语言取对应字段
 *   （原稿 .tag 小标签样式）；
 * - comingSoon 的系列挂「Coming Soon / 即将上线」角标，仍保留询盘入口；
 * - 拉取失败静默回退（content.ts 返回 null），绝不打断渲染或弹错误。
 *
 * 数据由 ADP 后台「fc-series」域维护（双语字段），改完即时生效、无需重新构建。
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { hasSeries } from "@/data/catalog";
import { fetchFilterSeries, type FilterSeries } from "@/lib/content";

/** 内置默认卡的形状（对齐 site.ts / site-zh.ts 的滤芯线 cards） */
export interface SeriesFallbackCard {
  title: string;
  text: string;
  cta: string;
  /** 内置卡直连系列页的落点（不配则退回询价页） */
  href?: string;
}

/** 渲染统一形状：内置卡与后台系列各字段映射到这里 */
interface SeriesCardView {
  key: string;
  title: string;
  text: string;
  facets: string[];
  comingSoon: boolean;
  cta: string;
  /** 卡片落点：能对上本地系列页就进系列页，否则进询价页 */
  href: string;
}

const COPY = {
  en: { cta: "Ask for Specifications", soon: "Coming Soon" },
  zh: { cta: "索取规格", soon: "即将上线" },
} as const;

export default function FilterSeriesGrid({
  fallback,
  locale = "en",
  contactHref,
}: {
  fallback: SeriesFallbackCard[];
  locale?: "en" | "zh";
  contactHref: string;
}) {
  const [series, setSeries] = useState<FilterSeries[] | null>(null);
  const copy = COPY[locale];

  useEffect(() => {
    let alive = true;
    fetchFilterSeries(locale).then((list) => {
      if (alive && list) setSeries(list);
    });
    return () => {
      alive = false;
    };
  }, [locale]);

  const cards: SeriesCardView[] =
    series?.map((s) => ({
      key: `db-${s.slug}`,
      title: (locale === "zh" ? s.nameZh : s.nameEn).trim(),
      text: (locale === "zh" ? s.taglineZh : s.taglineEn)?.trim() || "",
      facets: (locale === "zh" ? s.facetsZh : s.facetsEn ?? []).filter((f) =>
        f?.trim(),
      ),
      comingSoon: s.comingSoon,
      cta: copy.cta,
      // 后台系列 slug 能对上本地系列页（high-flow / pleated / …）才进系列页，
      // 否则退到询价页——宁可多一次询盘，也不制造 404 死链。
      href: hasSeries(s.slug)
        ? `${locale === "zh" ? "/zh" : ""}/products/${s.slug}`
        : contactHref,
    })) ??
    fallback.map((card, index) => ({
      key: `static-${index}`,
      title: card.title,
      text: card.text,
      facets: [],
      comingSoon: false,
      cta: card.cta,
      href: card.href ?? contactHref,
    }));

  return (
    <div className="grid" style={{ marginTop: 28 }}>
      {cards.map((card) => (
        <div className="card" key={card.key}>
          <div className="art">
            {card.comingSoon && (
              <span
                className="tag"
                style={{ position: "absolute", top: 12, right: 12, background: "#fff" }}
              >
                {copy.soon}
              </span>
            )}
          </div>
          <div className="card-body">
            <h3>{card.title}</h3>
            {card.text && <p>{card.text}</p>}
            {card.facets.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                {card.facets.map((facet) => (
                  <span className="tag" key={facet}>
                    {facet}
                  </span>
                ))}
              </div>
            )}
            <Link className="link" href={card.href}>
              {card.cta} →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
