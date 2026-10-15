"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PortfolioFilter, PortfolioItem } from "@/types/home";
import { contentApi } from "@/services/cms/api";

/** 每页产品数：桌面端 3 列 × 3 行。 */
const PAGE_SIZE = 9;

/** 产品图缺失时的占位图（本地资源，与瓷砖同为 7:5，不依赖任何外部服务）。 */
const PLACEHOLDER = "/images/product-placeholder.svg";

/**
 * "产品中心" grid. The source uses filterizr for the category filter and
 * magnific-popup for the image lightbox; both behaviours are reimplemented here
 * on top of the same markup and class names, so the original CSS still applies.
 *
 * 数据流：切换类目时按类目发数据请求（/api/v1/home-products?series=…），
 * 拿到产品列表后再按返回的图片地址加载图片；初始列表由服务端注入。
 *
 * 稳定性约定：
 * - 瓷砖图框固定 7:5（见 globals.css），图片缺失时换占位图，外框尺寸不变；
 * - onerror 换占位图只换一次（dataset 防止占位图再失败时死循环）；
 * - 超过 9 个产品分页（3 列 × 3 行），切类目/换数据时回到第 1 页。
 */
export default function ProductFilterGrid({
  title,
  filters,
  items: initialItems,
  lang = "zh",
  linkPrefix,
}: {
  title: string;
  filters: PortfolioFilter[];
  items: PortfolioItem[];
  lang?: "zh" | "en";
  /** 中文站的 CMS 链接是裸路径，需要补 /zh 前缀。 */
  linkPrefix?: string;
}) {
  const [active, setActive] = useState(filters[0]?.filter ?? "all");
  const [items, setItems] = useState<PortfolioItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  /** CMS 返回的链接是站点绝对路径（如 /products/filter-cartridges/high-flow），
      中文站要补成 /zh/...；已带前缀的不重复加。 */
  const withPrefix = useCallback(
    (link?: string) => {
      if (!link) return link;
      if (!linkPrefix) return link;
      return link.startsWith(`${linkPrefix}/`) ? link : `${linkPrefix}${link}`;
    },
    [linkPrefix],
  );

  /** 切换类目：发数据请求拿该类目产品，图片随返回数据加载。 */
  const selectFilter = useCallback(
    async (filter: string) => {
      setActive(filter);
      setLightboxIndex(null);
      setLoading(true);
      try {
        const res = await contentApi.homeProducts(lang, filter === "all" ? undefined : filter);
        setItems(res?.items ?? []);
      } catch {
        // 请求失败保持当前列表不变
      } finally {
        setLoading(false);
      }
    },
    [lang],
  );

  const visible = useMemo(
    () => items.filter((it) => active === "all" || it.category === active),
    [items, active],
  );

  /** 分页：类目或数据变化时回到第 1 页。 */
  useEffect(() => {
    setPage(1);
  }, [active, items]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const paged = useMemo(
    () => visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [visible, page],
  );

  /** 图片加载失败换占位图；只换一次，防死循环。 */
  const onImgError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.dataset.fallback) return;
    img.dataset.fallback = "1";
    img.src = PLACEHOLDER;
  }, []);

  const close = useCallback(() => setLightboxIndex(null), []);
  const step = useCallback(
    (delta: number) => {
      setLightboxIndex((i) => {
        if (i === null || paged.length === 0) return i;
        return (i + delta + paged.length) % paged.length;
      });
    },
    [paged.length],
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxIndex, close, step]);

  const current = lightboxIndex !== null ? paged[lightboxIndex] : null;
  const labels = lang === "zh" ? { prev: "上一页", next: "下一页" } : { prev: "Prev", next: "Next" };

  return (
    <section id="mu-portfolio">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="mu-portfolio-area">
              <div className="row">
                <div className="col-md-12">
                  <div className="mu-title">
                    <h2>{title}</h2>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="mu-portfolio-filter-area">
                  <ul className="mu-simplefilter">
                    {filters.map((f) => (
                      <li
                        className={f.filter === active ? "active" : undefined}
                        data-filter={f.filter}
                        key={f.filter}
                        onClick={() => selectFilter(f.filter)}
                      >
                        {f.label.replace(/\/$/, "")}
                        <span>/</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mu-portfolio-content">
                  <div className="filtr-container">
                    {paged.map((item, i) => (
                      <div
                        className="filtr-item"
                        data-category={item.category}
                        key={`${item.title}-${item.thumb}-${i}`}
                      >
                        <a
                          className="mu-imglink"
                          href={withPrefix(item.link) || item.full}
                          title={item.title}
                          onClick={(e) => {
                            // 有链接的瓷砖（板块/系列入口）直接跳页面，不弹大图
                            if (withPrefix(item.link)) return;
                            e.preventDefault();
                            setLightboxIndex(i);
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            className="img-responsive"
                            src={item.thumb || PLACEHOLDER}
                            alt={item.alt || item.title}
                            loading="lazy"
                            onError={onImgError}
                          />
                          <div className="mu-filter-item-content">
                            <h4 className="mu-filter-item-title">{item.title}</h4>
                          </div>
                        </a>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 ? (
                    <div className="mu-product-pagination">
                      <button
                        type="button"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        {labels.prev}
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                        <button
                          type="button"
                          key={n}
                          className={n === page ? "active" : undefined}
                          onClick={() => setPage(n)}
                        >
                          {n}
                        </button>
                      ))}
                      <button
                        type="button"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      >
                        {labels.next}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {current ? (
        <>
          <div className="mfp-bg mfp-fade mfp-ready" onClick={close} />
          <div
            className="mfp-wrap mfp-close-btn-in mfp-auto-cursor mfp-fade mfp-ready"
            role="dialog"
            aria-modal="true"
          >
            <div className="mfp-container mfp-image-holder mfp-s-ready">
              <div className="mfp-content">
                <div className="mfp-figure">
                  <button className="mfp-close" type="button" onClick={close}>
                    ×
                  </button>
                  <figure>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="mfp-img"
                      src={current.full || PLACEHOLDER}
                      alt={current.title}
                      onError={onImgError}
                    />
                    <figcaption className="mfp-bottom-bar">
                      <div className="mfp-title">{current.title}</div>
                      <div className="mfp-counter">
                        {lightboxIndex! + 1} / {paged.length}
                      </div>
                    </figcaption>
                  </figure>
                </div>
              </div>
              <button
                className="mfp-arrow mfp-arrow-left"
                type="button"
                aria-label="Previous"
                onClick={() => step(-1)}
              />
              <button
                className="mfp-arrow mfp-arrow-right"
                type="button"
                aria-label="Next"
                onClick={() => step(1)}
              />
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
