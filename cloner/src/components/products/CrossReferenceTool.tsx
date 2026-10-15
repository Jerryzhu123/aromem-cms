"use client";

import { useEffect, useMemo, useState } from "react";
import type { FcCrossReferenceRow } from "@/data/filterCartridges";
import { fcText, type FcLocale } from "@/data/fcText";
import { productHref, quoteHref } from "@/lib/fcLinks";

/** 归一化：忽略大小写、空格与连字符，与「输入原厂型号」的使用习惯对齐。 */
function normalize(value: string): string {
  return value.toLowerCase().replace(/[\s-]/g, "");
}

/**
 * Cross-Reference 工具（中英文共用）。
 *
 * 设计依据（方案第 4 章第 4 条 / 第 9.2 节）：
 *  - 输入「原厂型号或苏瑞膜型号」+ 可选品牌，双向查找；
 *  - 结果表给出苏瑞膜型号、原厂品牌与型号、关系类型与跳转链接；
 *  - 零结果不留死胡同：把用户输入带进询价页预填。
 */
export default function CrossReferenceTool({
  rows,
  brands,
  locale = "en",
}: {
  rows: FcCrossReferenceRow[];
  brands: string[];
  locale?: FcLocale;
}) {
  const dict = fcText(locale);
  const t = dict.quote;
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");

  /** 从产品页/卡片带过来的预查：?q=XXX */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
  }, []);

  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    return rows.filter((row) => {
      if (brand && row.brand !== brand) return false;
      return (
        normalize(row.oemModel).includes(q) || normalize(row.surmemModel).includes(q)
      );
    });
  }, [rows, query, brand]);

  const searched = normalize(query).length > 0;

  return (
    <div className="fc-tool">
      <div className="fc-tool-row">
        <input
          className="fc-input"
          type="search"
          value={query}
          placeholder={t.inputPlaceholder}
          aria-label={t.inputLabel}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="fc-select"
          value={brand}
          aria-label={t.allBrands}
          onChange={(e) => setBrand(e.target.value)}
        >
          <option value="">{t.allBrands}</option>
          {brands.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {!searched ? (
        <p className="fc-tool-empty">{t.emptyPrompt}</p>
      ) : results.length ? (
        <table className="fc-table" style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>{t.thSurmem}</th>
              <th>{t.thBrand}</th>
              <th>{t.thOem}</th>
              <th>{t.thRelation}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {results.map((row, index) => (
              <tr key={`${row.surmemModel}-${row.oemModel}-${index}`}>
                <td>{row.surmemModel}</td>
                <td>{row.brand}</td>
                <td>{row.oemModel}</td>
                <td>{dict.compat.relationLabels[row.relation] ?? row.relation}</td>
                <td>
                  <a href={productHref(row.seriesSlug, row.productSlug, locale)}>
                    {dict.viewProduct}
                  </a>
                  {" · "}
                  <a
                    href={quoteHref(locale, {
                      part: row.surmemModel,
                      series: row.seriesSlug,
                    })}
                  >
                    {dict.requestQuote}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="fc-tool-empty">
          <b>
            {t.noMatchPrefix} “{query}”
          </b>
          <br />
          {t.noMatchTail}{" "}
          <a href={quoteHref(locale, { part: query })}>{t.noMatchLink}</a>.
        </div>
      )}

      <p className="fc-compat-note">{t.disclaimer}</p>
    </div>
  );
}
