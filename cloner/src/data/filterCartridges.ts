/**
 * 工业滤芯产品线（Industrial Filter Cartridges）—— 本地静态数据源。
 *
 * 用途：
 *  1) 作为 CMS 接口不可达时的兜底数据（与首页一致：API 优先 + 静态兜底）；
 *  2) 作为页面模板的结构样本，让模板在没有后端、没有客户资料时也能完整渲染。
 *
 * 重要约定：
 *  - 客户尚未提供真实产品参数、认证与兼容型号对照，本文件**不编造任何 SURMEM 产品参数**；
 *    所有规格位一律使用占位值，页面以灰色样式呈现。
 *  - 兼容/替代型号使用 OEM-*-A 形式的合成占位，避免误用真实第三方商标；
 *    真实对照数据由客户提供后再替换。
 *
 * 双语约定：
 *  - 内容型文案（系列名/卖点/简介、型号标题/SEO）在本文件里以 *Zh 字段并存；
 *  - 界面文案（按钮、表头、占位提示…）在 src/data/fcText.ts 里按语言存放；
 *  - 组件统一通过 seriesText() / productText() 取对应语言，不再各自判断。
 */
import { FC_PENDING, type FcLocale } from "./fcText";

/** 规格位占位文案（英文站，保留旧引用）。 */
export const PENDING = FC_PENDING.en;

/** 页面提示条文案（英文站，保留旧引用）。 */
export const FC_PREVIEW_NOTICE =
  "Structure preview — product data, certifications and cross-reference mappings are pending client input.";

/** 系列（二级栏目）定义。comingSoon 的系列只作为结构占位，不生成可点击页面。 */
export interface FcSeries {
  slug: string;
  name: string;
  short: string;
  tagline: string;
  intro: string;
  nameZh: string;
  shortZh: string;
  taglineZh: string;
  introZh: string;
  comingSoon?: boolean;
  /** 前台分组：cartridge = 滤芯；housing = 壳体（2026-10-10 定位调整：壳体与滤芯并列展示）。 */
  group?: "cartridge" | "housing";
  /** 该系列列表页顶部展示的「可筛选维度」说明，不包含任何数值。 */
  filterFacets: string[];
  filterFacetsZh: string[];
}

/** 可替代 / 兼容型号行。 */
export interface FcCompatibleModel {
  brand: string;
  oemModel: string;
  /** direct replacement / compatible / similar spec（关系中文标签由 fcText 字典映射） */
  relation: "direct replacement" | "compatible" | "similar spec";
  note: string;
  noteZh: string;
}

/** 文档（规格书 / 图纸 / 证书）。 */
export interface FcDocument {
  docType: "datasheet" | "drawing" | "certificate" | "manual";
  title: string;
  titleZh: string;
  fileUrl: string | null;
  fileSizeBytes: number | null;
  lang: string;
  revision: string;
}

/** 产品（详情页一条）。规格字段与方案第 6 章字段规范一一对应。 */
export interface FcProduct {
  /** SURMEM 自有型号；客户提供前为占位。 */
  model: string;
  slug: string;
  seriesSlug: string;
  title: string;
  titleZh: string;
  subtitle: string;
  subtitleZh: string;
  gallery: string[];
  overallLength: string;
  overallLengthUnit: string;
  /** 中文站默认用公制；客户若提供 mm 值且与英寸值不完全等价，以后端字段为准。 */
  overallLengthUnitZh?: string;
  outsideDiameter: string;
  outsideDiameterUnit: string;
  outsideDiameterUnitZh?: string;
  innerDiameter: string;
  micronAbsolute: string;
  micronNominal: string;
  mediaMaterial: string[];
  endCap: string;
  connection: string;
  flowRateMin: string;
  flowRateMax: string;
  flowRateUnit: string;
  flowRateUnitZh?: string;
  maxTemperatureC: string;
  maxPressureDropPsid: string;
  applicationIndustries: string[];
  compatibleModels: FcCompatibleModel[];
  documents: FcDocument[];
  certifications: string[];
  seoTitle: string;
  seoTitleZh: string;
  seoDescription: string;
  seoDescriptionZh: string;
  /** awaiting-client-data = 结构预览，未拿到真实参数。 */
  dataStatus: "awaiting-client-data" | "provided";
}

/** 产品图占位（仓库内已有，不依赖任何外部资源）。 */
export const FC_PLACEHOLDER_IMAGE = "/images/product-placeholder.svg";

/** 三个已确认系列 + 两个后续系列占位。 */
export const FC_SERIES: FcSeries[] = [
  {
    slug: "high-flow",
    name: "High Flow Filter Cartridges",
    short: "High Flow",
    tagline: "High-volume filtration for industrial water treatment",
    intro:
      "High flow cartridges are built for high-volume industrial water treatment where a single cartridge element serves the flow of a full housing. Use this series page to compare media, micron rating, dimensions, end-cap style and flow range across models.",
    nameZh: "大流量滤芯",
    shortZh: "大流量滤芯",
    taglineZh: "面向工业水处理的大流量过滤",
    introZh:
      "大流量滤芯用于大流量工业水处理场合：单支滤芯即可承担整个滤壳的流量，减少滤芯数量与更换工时。进入系列页可按滤材、过滤精度、尺寸、端盖与流量区间逐项对比各型号。",
    filterFacets: [
      "Micron rating",
      "Overall length",
      "Outside diameter",
      "Media material",
      "End cap",
      "Flow rate",
      "Application industry",
    ],
    filterFacetsZh: [
      "过滤精度",
      "总长",
      "外径",
      "滤材",
      "端盖",
      "流量",
      "应用行业",
    ],
  },
  {
    slug: "pleated",
    name: "Pleated Filter Cartridges",
    short: "Pleated",
    tagline: "High surface area, low pressure drop",
    intro:
      "Pleated cartridges use a folded media pack to maximise surface area in a compact housing, giving low pressure drop and long service life. Filter this series by micron rating, media, dimensions and end cap.",
    nameZh: "折叠滤芯",
    shortZh: "折叠滤芯",
    taglineZh: "高过滤面积、低压降",
    introZh:
      "折叠滤芯采用折叠滤材，在紧凑滤壳内获得更大的有效过滤面积，压降低、寿命长。可按过滤精度、滤材、尺寸与端盖筛选本系列型号。",
    filterFacets: [
      "Micron rating",
      "Overall length",
      "Outside diameter",
      "Media material",
      "End cap",
      "Application industry",
    ],
    filterFacetsZh: ["过滤精度", "总长", "外径", "滤材", "端盖", "应用行业"],
  },
  {
    slug: "replacement-compatible",
    name: "Replacement & Compatible Filter Cartridges",
    short: "Replacement & Compatible",
    tagline: "Cross-reference an existing part number",
    intro:
      "Direct replacement and compatible cartridges for widely used industrial filter cartridges. Enter the part number you are running today in the Cross-Reference tool, or browse this series by specification.",
    nameZh: "替代与兼容滤芯",
    shortZh: "替代与兼容",
    taglineZh: "按原厂型号直接找替代货源",
    introZh:
      "面向通用工业滤芯的直接替代与兼容型号。在「型号对照」工具里输入你现在在用的原厂型号，或直接按参数浏览本系列。",
    filterFacets: [
      "Micron rating",
      "Overall length",
      "Outside diameter",
      "End cap",
      "Compatible brand",
    ],
    filterFacetsZh: ["过滤精度", "总长", "外径", "端盖", "可对照品牌"],
  },
  {
    slug: "pp-melt-blown",
    name: "PP Melt Blown Filter Cartridges",
    short: "PP Melt Blown",
    tagline: "Depth filtration at the lowest cost per cartridge",
    intro:
      "Melt blown cartridges are formed from 100% polypropylene in a graded pore structure, so particles are trapped through the depth of the media instead of only on the surface. Use this series page to compare micron rating, length, outside diameter and end-cap configuration.",
    nameZh: "PP 熔喷滤芯",
    shortZh: "PP 熔喷滤芯",
    taglineZh: "深度过滤，单支成本最低",
    introZh:
      "PP 熔喷滤芯由 100% 聚丙烯热熔成型，孔径由外向内逐层收紧，颗粒被滤材深度捕捉而不是只挡在表面。进入系列页可按过滤精度、长度、外径与端盖形式逐项对比各型号。",
    filterFacets: ["Micron rating", "Overall length", "Outside diameter", "End cap", "Media material"],
    filterFacetsZh: ["过滤精度", "总长", "外径", "端盖", "滤材"],
  },
  {
    slug: "string-wound",
    name: "String Wound Filter Cartridges",
    short: "String Wound",
    tagline: "Wound structure for high dirt holding capacity",
    intro:
      "String wound cartridges are built by winding yarn around a core, which gives a true depth structure and a high dirt holding capacity at low pressure drop. Compare models by micron rating, length, outside diameter and core material.",
    nameZh: "线绕滤芯",
    shortZh: "线绕滤芯",
    taglineZh: "线绕结构，纳污量大",
    introZh:
      "线绕滤芯由纤维纱线按设定密度缠绕在骨架上，形成真正的深层过滤结构，纳污量大、压降低。可按过滤精度、长度、外径与骨架材质逐项对比各型号。",
    filterFacets: ["Micron rating", "Overall length", "Outside diameter", "Core material", "Media material"],
    filterFacetsZh: ["过滤精度", "总长", "外径", "骨架材质", "滤材"],
  },
  {
    slug: "filter-housings",
    name: "Filter Housings",
    short: "Housings",
    tagline: "Single, multi-round and high flow housings for the cartridges above",
    intro:
      "Housings are bought together with the cartridges they hold, so they sit next to the cartridge series rather than under one of them. Compare by housing type, cartridge length, number of rounds, material and connection.",
    nameZh: "滤芯壳体",
    shortZh: "滤芯壳体",
    taglineZh: "单支 / 多支 / 大流量壳体，与滤芯配套采购",
    introZh:
      "壳体是跟滤芯配套一起买的，所以与滤芯并列、而不是藏在某一个滤芯系列下面。可按壳体形式、适配滤芯长度、支数、材质与接口逐项对比。",
    group: "housing",
    filterFacets: ["Housing type", "Cartridge length", "Number of rounds", "Material", "Max flow"],
    filterFacetsZh: ["壳体形式", "适配滤芯长度", "支数", "材质", "最大流量"],
  },
  {
    slug: "membrane-pleated",
    name: "Membrane Pleated Cartridges",
    short: "Membrane Pleated",
    tagline: "Structure placeholder",
    intro: "Reserved slot for a future series.",
    nameZh: "膜折叠滤芯",
    shortZh: "膜折叠滤芯",
    taglineZh: "结构占位",
    introZh: "预留系列位，确认后建页。",
    comingSoon: true,
    filterFacets: [],
    filterFacetsZh: [],
  },
];

function emptySpecs(): Pick<
  FcProduct,
  | "overallLength"
  | "outsideDiameter"
  | "innerDiameter"
  | "micronAbsolute"
  | "micronNominal"
  | "endCap"
  | "connection"
  | "flowRateMin"
  | "flowRateMax"
  | "maxTemperatureC"
  | "maxPressureDropPsid"
> {
  return {
    overallLength: PENDING,
    outsideDiameter: PENDING,
    innerDiameter: PENDING,
    micronAbsolute: PENDING,
    micronNominal: PENDING,
    endCap: PENDING,
    connection: PENDING,
    flowRateMin: PENDING,
    flowRateMax: PENDING,
    maxTemperatureC: PENDING,
    maxPressureDropPsid: PENDING,
  };
}

function compatiblePlaceholder(index: number): FcCompatibleModel {
  const letters = ["OEM-Brand-A", "OEM-Brand-B", "OEM-Brand-C"];
  return {
    brand: letters[index % letters.length],
    oemModel: `OEM-MODEL-${100 + index}`,
    relation:
      index % 3 === 0 ? "direct replacement" : index % 3 === 1 ? "compatible" : "similar spec",
    note: "Synthetic placeholder row — replace with the client-supplied cross-reference table.",
    noteZh: "合成占位行——待客户提供对照表后替换。",
  };
}

function makeProduct(seriesSlug: string, index: number): FcProduct {
  const prefix = seriesSlug === "high-flow" ? "HF" : seriesSlug === "pleated" ? "PL" : "RC";
  const model = `${prefix}-XXXX-0${index + 1}`;
  return {
    model,
    slug: `${model.toLowerCase()}`,
    seriesSlug,
    title: `${model} Filter Cartridge`,
    titleZh: `${model} 工业滤芯`,
    subtitle: "Model name, series and key specification summary are pending client input.",
    subtitleZh: "型号名称、所属系列与关键参数摘要待客户提供资料。",
    gallery: [FC_PLACEHOLDER_IMAGE],
    ...emptySpecs(),
    overallLengthUnit: "in",
    overallLengthUnitZh: "mm",
    outsideDiameterUnit: "in",
    outsideDiameterUnitZh: "mm",
    flowRateUnit: "GPM",
    flowRateUnitZh: "m³/h",
    mediaMaterial: [PENDING],
    applicationIndustries: [PENDING],
    compatibleModels: [compatiblePlaceholder(index), compatiblePlaceholder(index + 1)],
    documents: [
      {
        docType: "datasheet",
        title: `${model} — Datasheet (pending)`,
        titleZh: `${model} — 规格书（待上传）`,
        fileUrl: null,
        fileSizeBytes: null,
        lang: "EN / 中文",
        revision: "",
      },
    ],
    certifications: [],
    seoTitle: `${model} Filter Cartridge | SURMEM`,
    seoTitleZh: `${model} 工业滤芯｜苏州苏瑞膜 SURMEM`,
    seoDescription:
      "Product datasheet, specification table and cross-reference information for this SURMEM filter cartridge.",
    seoDescriptionZh: "该型号的规格参数表、可替代/兼容型号对照与规格书下载。",
    dataStatus: "awaiting-client-data",
  };
}

export const FC_PRODUCTS: FcProduct[] = [
  makeProduct("high-flow", 0),
  makeProduct("high-flow", 1),
  makeProduct("high-flow", 2),
  makeProduct("pleated", 0),
  makeProduct("pleated", 1),
  makeProduct("replacement-compatible", 0),
  makeProduct("replacement-compatible", 1),
];

/* ------------------------------------------------------------------ */
/* 取文函数：组件不再各自判断语言，统一走这里 */
/* ------------------------------------------------------------------ */

/** 系列文案（按语言）。 */
export function seriesText(series: FcSeries, locale: FcLocale) {
  return locale === "zh"
    ? {
        name: series.nameZh || series.name,
        short: series.shortZh || series.short,
        tagline: series.taglineZh || series.tagline,
        intro: series.introZh || series.intro,
        facets: series.filterFacetsZh.length ? series.filterFacetsZh : series.filterFacets,
      }
    : {
        name: series.name,
        short: series.short,
        tagline: series.tagline,
        intro: series.intro,
        facets: series.filterFacets,
      };
}

/** 型号文案（按语言）。 */
export function productText(product: FcProduct, locale: FcLocale) {
  return locale === "zh"
    ? {
        title: product.titleZh || product.title,
        subtitle: product.subtitleZh || product.subtitle,
        seoTitle: product.seoTitleZh || product.seoTitle,
        seoDescription: product.seoDescriptionZh || product.seoDescription,
        lengthUnit: product.overallLengthUnitZh || product.overallLengthUnit,
        diameterUnit: product.outsideDiameterUnitZh || product.outsideDiameterUnit,
        flowUnit: product.flowRateUnitZh || product.flowRateUnit,
      }
    : {
        title: product.title,
        subtitle: product.subtitle,
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
        lengthUnit: product.overallLengthUnit,
        diameterUnit: product.outsideDiameterUnit,
        flowUnit: product.flowRateUnit,
      };
}

/** 文档标题（按语言）。 */
export function documentTitle(doc: FcDocument, locale: FcLocale): string {
  return locale === "zh" ? doc.titleZh || doc.title : doc.title;
}

/** 对照行说明（按语言）。 */
export function compatibleNote(row: FcCompatibleModel, locale: FcLocale): string {
  return locale === "zh" ? row.noteZh || row.note : row.note;
}

/* ------------------------------------------------------------------ */
/* 查询函数 */
/* ------------------------------------------------------------------ */

/** 系列查询。 */
export function getSeries(slug: string): FcSeries | undefined {
  return FC_SERIES.find((s) => s.slug === slug);
}

/** 某系列下的产品。 */
export function getSeriesProducts(slug: string): FcProduct[] {
  return FC_PRODUCTS.filter((p) => p.seriesSlug === slug);
}

/** 单个产品。 */
export function getProduct(seriesSlug: string, modelSlug: string): FcProduct | undefined {
  return FC_PRODUCTS.find(
    (p) => p.seriesSlug === seriesSlug && p.slug === modelSlug.toLowerCase(),
  );
}

/** 全量可替代/兼容型号索引（cross-reference 用）。 */
export interface FcCrossReferenceRow extends FcCompatibleModel {
  surmemModel: string;
  seriesSlug: string;
  productSlug: string;
}

export const FC_CROSS_REFERENCE: FcCrossReferenceRow[] = FC_PRODUCTS.flatMap((p) =>
  p.compatibleModels.map((row) => ({
    ...row,
    surmemModel: p.model,
    seriesSlug: p.seriesSlug,
    productSlug: p.slug,
  })),
);

/** 兼容品牌清单（供 cross-reference 下拉）。 */
export const FC_COMPATIBLE_BRANDS: string[] = Array.from(
  new Set(FC_CROSS_REFERENCE.map((r) => r.brand)),
).sort();

/** 本地 cross-reference 检索（后端接口不可达时使用）。 */
export function searchCrossReference(query: string, brand?: string): FcCrossReferenceRow[] {
  const q = query.trim().toLowerCase().replace(/[\s-]/g, "");
  if (!q) return [];
  return FC_CROSS_REFERENCE.filter((row) => {
    if (brand && row.brand !== brand) return false;
    const hay = [row.oemModel, row.surmemModel].join("|").toLowerCase().replace(/[\s-]/g, "");
    return hay.includes(q);
  });
}
