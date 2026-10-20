/**
 * darlly 条目 → 站点型号结构（CatalogProduct）的适配层。
 *
 * 目的：让三个复制品类的 50 款产品沿用站点既有的型号详情模板
 * （components/products/ProductView.tsx），不另起一套详情页版式。
 * 这样从任何一个列表点进详情，视觉与结构都和站内其它型号一致。
 *
 * 已知缺口（不编造）：
 * - 原站详情页的参数表（尺寸/精度/材质/订购信息）在 WordPress 正文里，
 *   本次只复制品类页，未逐型号抓正文，故 spec 用一句中性的
 *   「以现行数据表为准」，等下一轮抓正文时再补成真实参数。
 * - 已核实/未核实的边界用原站文案本身作为 summary，不自称已确认。
 */
import {
  type Bilingual,
  type CatalogProduct,
  FILTER_APPLICATION,
  FILTER_CHECKLIST,
  FILTER_VERIFICATION,
  getProduct,
} from "./catalog";
import { type DarllyCategory, type DarllyItem, getDarllyCategory } from "./darlly";

/** 参数暂缺时的中性表述（不假装有数据） */
const SPEC_PENDING: Bilingual = {
  en: "Dimensions, micron rating and materials follow the current datasheet.",
  zh: "尺寸、过滤精度与材质以现行数据表为准。",
};

const TECH_NOTE: Bilingual = {
  en: "Confirm length, outside diameter, connection or end-cap style, micron rating and the housing it will replace before ordering.",
  zh: "订购前需核对长度、外径、接口或端盖形式、过滤精度，以及所要替换的滤壳型号。",
};

/** 把一件 darlly 产品包装成站点通用的型号结构 */
export function toCatalogProduct(
  category: DarllyCategory,
  item: DarllyItem,
): CatalogProduct {
  return {
    model: item.model,
    slug: item.slug,
    seriesSlug: category.slug,
    kind: "filter",
    name: item.name,
    category: category.crumb,
    spec: SPEC_PENDING,
    summary: item.desc,
    checklist: FILTER_CHECKLIST,
    application: FILTER_APPLICATION,
    technicalNote: TECH_NOTE,
    verification: FILTER_VERIFICATION,
    sourceUrl: item.sourceUrl,
    photo: item.img,
  };
}

/**
 * 详情页取数。
 *
 * 三个已复制的品类以 darlly 文案为准（列表页显示的就是这套文案，点进来
 * 必须是同一套）。若站内旧清单里有同型号，则把旧清单里更扎实的字段
 * （参考规格、技术提醒、核实声明）合并进来，避免参数信息白白丢掉。
 */
export function resolveCatalogProduct(
  seriesSlug: string,
  modelSlug: string,
): CatalogProduct | undefined {
  const existing = getProduct(seriesSlug, modelSlug);

  const category = getDarllyCategory(seriesSlug);
  const item = category?.items.find((i) => i.slug === modelSlug);
  if (!category || !item) return existing;

  const base = toCatalogProduct(category, item);
  if (!existing) return base;

  return {
    ...base,
    spec: existing.spec,
    technicalNote: existing.technicalNote,
    checklist: existing.checklist,
    application: existing.application,
    verification: existing.verification,
  };
}
