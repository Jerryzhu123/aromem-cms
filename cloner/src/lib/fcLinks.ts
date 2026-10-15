/**
 * 滤芯栏目内部链接生成器。
 *
 * 中文站在 /zh 下，英文站在根路径，页面和组件都从这里取链接，
 * 避免在十几个文件里手写字符串时把中英文路径写错。
 */
import type { FcLocale } from "@/data/fcText";

/** 英文站在根路径（不加前缀），中文站加 /zh 前缀。 */
export function fcPrefix(locale: FcLocale = "en"): string {
  return locale === "zh" ? "/zh" : "";
}

/** 首页。 */
export function fcHome(locale: FcLocale = "en"): string {
  return locale === "zh" ? "/zh" : "/";
}

/** 产品中心列表页（现有克隆页，带 id 参数）。 */
export function fcProductsIndex(locale: FcLocale = "en"): string {
  return locale === "zh" ? "/zh/products?id=22" : "/products?id=3";
}

/** 滤芯大类落地页。 */
export function fcLanding(locale: FcLocale = "en"): string {
  return `${fcPrefix(locale)}/products/filter-cartridges`;
}

/** 系列列表页。 */
export function seriesHref(seriesSlug: string, locale: FcLocale = "en"): string {
  return `${fcLanding(locale)}/${seriesSlug}`;
}

/** 产品详情页。 */
export function productHref(
  seriesSlug: string,
  modelSlug: string,
  locale: FcLocale = "en",
): string {
  return `${seriesHref(seriesSlug, locale)}/${modelSlug}`;
}

/** 型号对照工具。 */
export function crossRefHref(locale: FcLocale = "en", query?: string): string {
  const base = `${fcPrefix(locale)}/cross-reference`;
  return query ? `${base}?q=${encodeURIComponent(query)}` : base;
}

/** 询价页；带上型号/系列/来源，方便客服直接看到客户要的是哪个型号。 */
export function quoteHref(
  locale: FcLocale = "en",
  params?: { part?: string; series?: string; model?: string },
): string {
  return withParams(`${fcPrefix(locale)}/request-a-quote`, params);
}

/** 样品申请页。 */
export function sampleHref(
  locale: FcLocale = "en",
  params?: { part?: string; series?: string; model?: string },
): string {
  return withParams(`${fcPrefix(locale)}/request-a-sample`, params);
}

function withParams(
  base: string,
  params?: { part?: string; series?: string; model?: string },
): string {
  if (!params) return base;
  const search = new URLSearchParams();
  if (params.part) search.set("part", params.part);
  if (params.series) search.set("series", params.series);
  if (params.model) search.set("model", params.model);
  const qs = search.toString();
  return qs ? `${base}?${qs}` : base;
}
