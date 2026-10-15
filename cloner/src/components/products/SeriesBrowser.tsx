"use client";

import { useEffect, useMemo, useState } from "react";
import { productText, type FcProduct } from "@/data/filterCartridges";
import { fcText, isPending, type FcLocale } from "@/data/fcText";
import { quoteHref } from "@/lib/fcLinks";
import ProductCard from "./ProductCard";

function optionsOf(values: string[][]): string[] {
  const set = new Set<string>();
  values.flat().forEach((v) => {
    if (v && !isPending(v)) set.add(v);
  });
  return Array.from(set).sort();
}

/**
 * 系列列表页的「筛选器 + 产品网格」（中英文共用）。
 *
 * 设计依据（方案第 5.2 / 6.2）：
 *  - 筛选维度覆盖 Micron / 长度 / 外径 / 材质 / 端盖接口 / 流量 / 应用行业；
 *  - 筛选条件写回 URL 查询参数（可分享、可收录）；
 *  - 客户数据未到位时，数值型区间筛选器以禁用状态出现并给出说明，
 *    而不是假装能筛或直接隐藏（否则上线后会看不到这层结构）。
 */
export default function SeriesBrowser({
  products,
  facets,
  locale = "en",
}: {
  products: FcProduct[];
  facets: string[];
  locale?: FcLocale;
}) {
  const t = fcText(locale).browser;
  const [q, setQ] = useState("");
  const [media, setMedia] = useState("");
  const [endCap, setEndCap] = useState("");
  const [sort, setSort] = useState("model");

  const mediaOptions = useMemo(
    () => optionsOf(products.map((p) => p.mediaMaterial)),
    [products],
  );
  const endCapOptions = useMemo(
    () => optionsOf(products.map((p) => [p.endCap])),
    [products],
  );
  /** 数值型参数是否已就绪（长度/外径/micron/流量任何一个有真实值即可开启区间筛选）。 */
  const numericReady = useMemo(
    () =>
      products.some((p) =>
        [p.micronAbsolute, p.overallLength, p.outsideDiameter, p.flowRateMin].some(
          (v) => !isPending(v),
        ),
      ),
    [products],
  );

  /** 首屏从 URL 读取初始筛选值（避免 useSearchParams 对静态预渲染的额外要求）。 */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQ(params.get("q") ?? "");
    setMedia(params.get("media") ?? "");
    setEndCap(params.get("cap") ?? "");
    setSort(params.get("sort") ?? "model");
  }, []);

  /** 筛选项写回 URL：可分享、可被搜索引擎收录到不同筛选组合。 */
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (media) params.set("media", media);
    if (endCap) params.set("cap", endCap);
    if (sort && sort !== "model") params.set("sort", sort);
    const search = params.toString();
    const url = `${window.location.pathname}${search ? `?${search}` : ""}`;
    window.history.replaceState(null, "", url);
  }, [q, media, endCap, sort]);

  const visible = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    const list = products.filter((p) => {
      if (
        keyword &&
        !`${p.model} ${productText(p, locale).title} ${p.compatibleModels
          .map((c) => c.oemModel)
          .join(" ")}`
          .toLowerCase()
          .includes(keyword)
      ) {
        return false;
      }
      if (media && !p.mediaMaterial.includes(media)) return false;
      if (endCap && p.endCap !== endCap) return false;
      return true;
    });
    if (sort === "model-desc") return [...list].sort((a, b) => b.model.localeCompare(a.model));
    return [...list].sort((a, b) => a.model.localeCompare(b.model));
  }, [products, q, media, endCap, sort, locale]);

  return (
    <>
      <div className="fc-tool" id="fc-filters">
        <div className="fc-tool-row">
          <input
            className="fc-input"
            type="search"
            value={q}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchLabel}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="fc-select"
            value={media}
            aria-label={t.allMedia}
            onChange={(e) => setMedia(e.target.value)}
          >
            <option value="">{t.allMedia}</option>
            {mediaOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            className="fc-select"
            value={endCap}
            aria-label={t.allEndCaps}
            onChange={(e) => setEndCap(e.target.value)}
          >
            <option value="">{t.allEndCaps}</option>
            {endCapOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            className="fc-select"
            value={sort}
            aria-label={t.sortLabel}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="model">{t.sortAZ}</option>
            <option value="model-desc">{t.sortZA}</option>
          </select>
        </div>

        <div className="fc-tool-row" style={{ marginTop: 12 }}>
          <input
            className="fc-input"
            type="text"
            disabled={!numericReady}
            placeholder={t.micronRange}
            aria-label={t.micronRange}
          />
          <input
            className="fc-input"
            type="text"
            disabled={!numericReady}
            placeholder={t.lengthRange}
            aria-label={t.lengthRange}
          />
          <input
            className="fc-input"
            type="text"
            disabled={!numericReady}
            placeholder={t.odRange}
            aria-label={t.odRange}
          />
          <input
            className="fc-input"
            type="text"
            disabled={!numericReady}
            placeholder={t.flowRange}
            aria-label={t.flowRange}
          />
        </div>

        <p className="fc-hint">
          {t.facetsPrefix}
          {facets.join(" · ")}
          {numericReady ? "" : t.numericHint}
        </p>
      </div>

      <p className="fc-hint" style={{ marginBottom: 14 }}>
        {t.count(visible.length, products.length)}
      </p>

      {visible.length ? (
        <div className="fc-grid">
          {visible.map((product) => (
            <ProductCard key={product.slug} product={product} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="fc-empty">
          {t.empty}{" "}
          <a href={quoteHref(locale)}>{fcText(locale).requestQuote}</a>.
        </div>
      )}
    </>
  );
}
