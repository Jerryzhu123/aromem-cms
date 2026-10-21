/**
 * darlly 品类页视图（完全复制）。
 *
 * 结构逐字对原站：
 *   .d-banner.other  → 背景图横幅（Product.jpg，1920×300）
 *   .d-crumbs        → 「首页 » 品类名」
 *   .d-soncat        → 「选择类别」+ 子分类药丸
 *   .d-products.application2.product2 → 图 + 标题 + 描述 + 了解更多
 *   .d-products .footer .pagination   → 每页 9 条，上一页 / 页码 / 下一页
 *
 * 与原站行为差异（仅一处）：原站的子分类与页码都是独立 URL 的新页面，
 * 我们做成同页即时切换——因为静态导出下每个子分类再铺一遍分页路由
 * 会多出十几条与父级重复的地址，对收录没有增益。筛选与翻页依据都是
 * 后台真实数据（子分类归属在型号的 subcats_json 字段，每页条数同原站 9 条），
 * 交集为空时给空状态，不编造型号。
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { type Locale, pick } from "@/data/catalog";
import type { DarllyCategory } from "@/data/darlly-types";

const COPY = {
  en: {
    home: "Home",
    detail: "Learn more",
    prev: "Previous",
    next: "Next",
    emptyTitle: "Model list for this category is being compiled",
    emptyBody:
      "This category is within our supply scope, but its model list is still being consolidated. Send us the required media, micron rating or an existing part number and we will reply with the available options.",
    emptyCta: "Ask about this category",
  },
  zh: {
    home: "首页",
    detail: "了解更多",
    prev: "上一页",
    next: "下一页",
    emptyTitle: "该类别的型号清单整理中",
    emptyBody:
      "该类别属于我们的供货范围，型号清单仍在汇总。把所需滤材、过滤精度或已有型号发给我们，我们会回复可选方案。",
    emptyCta: "咨询该类别",
  },
} as const;

/**
 * 分页页码窗口化。
 *
 * 三个品类只有 2~6 页，全列出来没问题；泳池 495 款按每页 9 条要 55 页，
 * 全列会把整行撑成一条长龙。这里始终保留首末页，当前页左右各留一页，
 * 中间用省略号收口。页数 ≤ 7 时行为与原来完全一致（不影响其它品类）。
 */
function pageWindow(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const keep = new Set<number>([1, total, current, current - 1, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((n) => keep.add(n));
  if (current >= total - 2) [total - 1, total - 2, total - 3].forEach((n) => keep.add(n));
  const nums = [...keep].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push("gap");
    out.push(n);
  });
  return out;
}

export default function DarllyCategoryView({
  category,
  locale,
}: {
  category: DarllyCategory;
  locale: Locale;
}) {
  const t = COPY[locale];
  const base = locale === "zh" ? "/zh" : "";
  const [active, setActive] = useState<string>("all");
  const [page, setPage] = useState(1);

  const current = category.subcats.find((s) => s.key === active);
  const visible = current
    ? category.items.filter((item) => current.models.includes(item.slug))
    : category.items;

  const size = category.pageSize;
  const pageCount = Math.max(1, Math.ceil(visible.length / size));
  const safePage = Math.min(page, pageCount);
  const paged = visible.slice((safePage - 1) * size, safePage * size);

  /* 切换子分类时回到第 1 页，与原站跳转到该分类首页的行为一致 */
  function selectSub(key: string) {
    setActive(key);
    setPage(1);
  }

  return (
    <div className="dl-page">
      <div
        className="dl-banner dl-other"
        style={{ backgroundImage: `url(${category.banner})` }}
      />

      {/* 视觉隐藏的 h1：原站横幅是纯图片、无标题文字，但页面需要一个 h1 */}
      <h1 className="dl-sr-only">{pick(category.crumb, locale)}</h1>

      <div className="dl-crumbs">
        <div className="dl-container">
          <p>
            <Link href={base || "/"}>{t.home}</Link>
            <span> » </span>
            <span>{pick(category.crumb, locale)}</span>
          </p>
        </div>
      </div>

      {/* 筛选条只在真有子分类时出现。膜接触器 4 条同属一类，
          若照渲染会剩下一个孤零零的「所有」按钮，白占一行高度。 */}
      {category.subcats.length > 0 && (
        <section>
          <div className="dl-soncat">
            <div className="dl-container">
              <div className="dl-soncat-content">
                <div className="dl-soncat-header">
                  {pick(category.header, locale)}
                </div>
                <div className="dl-soncat-body">
                  <button
                    type="button"
                    className={active === "all" ? "on" : undefined}
                    onClick={() => selectSub("all")}
                  >
                    {pick(category.allLabel, locale)}
                  </button>
                  {category.subcats.map((sub) => (
                    <button
                      type="button"
                      key={sub.key}
                      className={active === sub.key ? "on" : undefined}
                      onClick={() => selectSub(sub.key)}
                    >
                      {pick(sub.label, locale)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="dl-products dl-application2 dl-product2">
          <div className="dl-container">
            {paged.length > 0 ? (
              <>
                <div className="dl-products-body">
                  {paged.map((item) => {
                    const href = `${base}/products/${category.slug}/${item.slug}`;
                    return (
                      <div className="dl-item" key={item.slug}>
                        <div className="dl-item-img">
                          <Link href={href}>
                            {/* 原图直出：产品图需保持原始像素，不走优化器 */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.img}
                              alt={pick(item.name, locale)}
                              loading="lazy"
                            />
                          </Link>
                        </div>
                        <div className="dl-item-body">
                          <Link href={href}>
                            <p className="dl-tit">{pick(item.name, locale)}</p>
                            <p>{pick(item.desc, locale)}</p>
                            <div>
                              <span className="dl-btn">{t.detail}</span>
                            </div>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {pageCount > 1 && (
                  <div className="dl-footer">
                    <div className="dl-pagination">
                      {safePage > 1 && (
                        <button
                          type="button"
                          className="prev"
                          onClick={() => setPage(safePage - 1)}
                        >
                          {t.prev}
                        </button>
                      )}
                      {pageWindow(safePage, pageCount).map((n, i) =>
                        n === "gap" ? (
                          <span key={`gap-${i}`} className="dl-page-gap">
                            …
                          </span>
                        ) : (
                          <button
                            type="button"
                            key={n}
                            className={n === safePage ? "current" : undefined}
                            onClick={() => setPage(n)}
                          >
                            {n}
                          </button>
                        ),
                      )}
                      {safePage < pageCount && (
                        <button
                          type="button"
                          className="next"
                          onClick={() => setPage(safePage + 1)}
                        >
                          {t.next}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="dl-empty">
                <h2>{t.emptyTitle}</h2>
                <p>{t.emptyBody}</p>
                <Link className="dl-more" href={`${base}/contact`}>
                  {t.emptyCta} →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
