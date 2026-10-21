/**
 * 产品目录的**类型定义与静态文案**（不再是型号数据的存放处）。
 *
 * 历史：本文件原本还存放 7 个系列 + 25 个型号的完整数据（客户交付包
 * SURMEM_V19 的 catalog-data.js 逐条搬运）。2026-10-21 起这些数据搬进了
 * 后台数据库（fc_product / fc_series，V11 迁移），页面在渲染时经
 * lib/catalog-source.ts 取数；本文件只留三样东西：
 *
 *   1. 类型（CatalogSeries / CatalogProduct / Bilingual）——页面与数据源共用；
 *   2. 系列认知（hasSeries / seriesKind）——路由约定，不随内容运营变；
 *   3. 与数据无关的静态文案（RO 对比表、图库）。
 *
 * 2026-10-21 追加：darlly 那 50 条也入库了，原先只供它们补位的
 * FILTER_CHECKLIST / FILTER_APPLICATION / FILTER_VERIFICATION 三个模板常量
 * 随之失去消费者，已删除——报价清单与核实声明现在都从 fc_series 取。
 *
 * 纪律：V19 原文里的「仅核实了官网可见特征 / 需型号数据表确认」等声明
 * 一律保留在 verification 字段并在页面上展示，不得删改成「已确认」。
 */

export type Locale = "en" | "zh";

/** 双语文本 */
export interface Bilingual {
  en: string;
  zh: string;
}

/** 产品系列（对应 URL 第一段，也是后台 fc_series.slug 的建议取值） */
export interface CatalogSeries {
  slug: string;
  kind: "filter" | "ro";
  name: Bilingual;
  tagline: Bilingual;
}

/** 单个型号 */
export interface CatalogProduct {
  /** 型号编码，如 MHF、XLP-4040（即 V19 的 id） */
  model: string;
  /** URL 段，型号小写 */
  slug: string;
  seriesSlug: string;
  kind: "filter" | "ro";
  /** 产品名（含型号前缀，页面标题直接用） */
  name: Bilingual;
  /** 归类名，如 High Flow / 极低压 */
  category: Bilingual;
  /** 参考规格一句话摘要 */
  spec: Bilingual;
  summary: Bilingual;
  checklist: { en: string[]; zh: string[] };
  application: Bilingual;
  technicalNote: Bilingual;
  verification: Bilingual;
  /** 厂家公开页来源（可空：部分型号仅系列页可查） */
  sourceUrl: string;
  /** 产品图（可空：未逐型号核实前留空，页面上如实标注「待核实」） */
  photo?: string;
}

/* ── 系列认知（纯静态，不含数据）──────────────────────────
 *
 * 2026-10-21 起，系列与型号的**数据**在渲染时从后台接口取（lib/catalog-source.ts），
 * 不再是编译期常量。但「站点认识哪几个系列」这件事属于路由约定，仍然写在这里：
 *   - hasSeries 决定后台系列卡要不要直接跳系列页（客户端组件里同步判断，不能 await）；
 *   - seriesKind 决定一个系列属于滤芯线还是 RO 线（列表页分栏用）。
 * 这两件事只会随站点改版变，不会随内容运营变，所以留在常量里是对的。
 */

const KNOWN_SERIES = new Set([
  "high-flow",
  "pleated",
  "multifold",
  "pool",
  "depth",
  "specialty",
  "ro-membranes",
]);

/** 该系列 slug 是否有对应系列页（决定系列卡是否可直接跳转） */
export function hasSeries(slug: string): boolean {
  return KNOWN_SERIES.has(slug);
}

/** 系列所属产品线。RO 板块只有 ro-membranes 一个系列，其余都归滤芯线。 */
export function seriesKind(slug: string): "filter" | "ro" {
  return slug === "ro-membranes" ? "ro" : "filter";
}

/** 取本地化字段 */
export function pick(text: Bilingual, locale: Locale): string {
  return locale === "zh" ? text.zh : text.en;
}

/* ── RO 膜对比表（结构化参数，供 /ro-comparison 渲染） ──────
 * 数值取自 V15 原厂英文页核对表，与 catalog.ts 的 spec 字符串同源；
 * 每个系列测试条件不同，横向比较前必须先看 feed / pressure 两列。
 * XLP-4040 的英中官网数值冲突已在页面单独标注，此处采用英文页版本。
 */
export interface RoComparisonRow {
  model: string;
  slug: string;
  /** 标称产水量 GPD */
  flowGpd: number;
  /** 稳定脱盐率 % */
  rejectionStable: string;
  /** 最低脱盐率 % */
  rejectionMin: string;
  /** 有效膜面积 ft² */
  areaFt2: number;
  /** 测试进液 NaCl 浓度 */
  testFeed: string;
  /** 测试压力 */
  testPressure: string;
  sourceUrl: string;
}

export const RO_COMPARISON: RoComparisonRow[] = [
  {
    model: "XLP-4040",
    slug: "xlp-4040",
    flowGpd: 2300,
    rejectionStable: "98.5",
    rejectionMin: "98.0",
    areaFt2: 85,
    testFeed: "500 ppm NaCl",
    testPressure: "100 psi (0.69 MPa)",
    sourceUrl: "https://www.aromem.com/en_products?id=6.html",
  },
  {
    model: "XLP-8040",
    slug: "xlp-8040",
    flowGpd: 9000,
    rejectionStable: "98.5",
    rejectionMin: "98.0",
    areaFt2: 400,
    testFeed: "500 ppm NaCl",
    testPressure: "100 psi (0.69 MPa)",
    sourceUrl: "https://www.aromem.com/en_products?id=6.html",
  },
  {
    model: "ULP-4040",
    slug: "ulp-4040",
    flowGpd: 2600,
    rejectionStable: "99.2",
    rejectionMin: "99.0",
    areaFt2: 85,
    testFeed: "1,500 ppm NaCl",
    testPressure: "150 psi (1.03 MPa)",
    sourceUrl: "https://aromem.com/en_products?id=8.html",
  },
  {
    model: "ULP-8040",
    slug: "ulp-8040",
    flowGpd: 12000,
    rejectionStable: "99.2",
    rejectionMin: "99.0",
    areaFt2: 400,
    testFeed: "1,500 ppm NaCl",
    testPressure: "150 psi (1.03 MPa)",
    sourceUrl: "https://aromem.com/en_products?id=8.html",
  },
  {
    model: "ULP-4040HR",
    slug: "ulp-4040hr",
    flowGpd: 2400,
    rejectionStable: "99.4",
    rejectionMin: "99.2",
    areaFt2: 85,
    testFeed: "1,500 ppm NaCl",
    testPressure: "150 psi (1.03 MPa)",
    sourceUrl: "https://aromem.com/en_products?id=8.html",
  },
  {
    model: "ULP-8040HR",
    slug: "ulp-8040hr",
    flowGpd: 10500,
    rejectionStable: "99.4",
    rejectionMin: "99.2",
    areaFt2: 400,
    testFeed: "1,500 ppm NaCl",
    testPressure: "150 psi (1.03 MPa)",
    sourceUrl: "https://aromem.com/en_products?id=8.html",
  },
  {
    model: "BW-4040",
    slug: "bw-4040",
    flowGpd: 2500,
    rejectionStable: "99.5",
    rejectionMin: "99.3",
    areaFt2: 85,
    testFeed: "2,000 ppm NaCl",
    testPressure: "225 psi (1.55 MPa)",
    sourceUrl: "https://aromem.com/en_products?id=10.html",
  },
  {
    model: "BW-8040",
    slug: "bw-8040",
    flowGpd: 10500,
    rejectionStable: "99.5",
    rejectionMin: "99.3",
    areaFt2: 400,
    testFeed: "2,000 ppm NaCl",
    testPressure: "225 psi (1.55 MPa)",
    sourceUrl: "https://aromem.com/en_products?id=10.html",
  },
  {
    model: "BW-4040FR",
    slug: "bw-4040fr",
    flowGpd: 2300,
    rejectionStable: "99.5",
    rejectionMin: "99.3",
    areaFt2: 85,
    testFeed: "2,000 ppm NaCl",
    testPressure: "225 psi (1.55 MPa)",
    sourceUrl: "https://aromem.com/en_products?id=10.html",
  },
  {
    model: "BW-8040FR",
    slug: "bw-8040fr",
    flowGpd: 9500,
    rejectionStable: "99.5",
    rejectionMin: "99.3",
    areaFt2: 400,
    testFeed: "2,000 ppm NaCl",
    testPressure: "225 psi (1.55 MPa)",
    sourceUrl: "https://aromem.com/en_products?id=10.html",
  },
];

/* ── 产品实拍图库（20 张，来自客户上传的现场照片） ──────────
 * 纪律：照片尚未与具体型号建立对应关系，图库只按视觉特征分类，
 * 页面必须保留「型号待核实」声明，不得把照片当成某个型号的实拍。
 */
export interface GalleryPhoto {
  file: string;
  label: Bilingual;
}

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  { file: "filter-photo-01.jpg", label: { en: "Depth cartridge — front", zh: "深层滤芯 — 正面" } },
  { file: "filter-photo-02.jpg", label: { en: "Pleated cartridge — detail", zh: "折叠滤芯 — 细节" } },
  { file: "filter-photo-03.jpg", label: { en: "Depth cartridge — angled", zh: "深层滤芯 — 斜视" } },
  { file: "filter-photo-04.jpg", label: { en: "Depth cartridge — close-up", zh: "深层滤芯 — 特写" } },
  { file: "filter-photo-05.jpg", label: { en: "Pleated cartridge — group", zh: "折叠滤芯 — 成组" } },
  { file: "filter-photo-06.jpg", label: { en: "Cartridges — packaging", zh: "滤芯 — 包装" } },
  { file: "filter-photo-07.jpg", label: { en: "Long cartridge — shipping", zh: "长滤芯 — 运输" } },
  { file: "filter-photo-08.jpg", label: { en: "Pleated cartridge — angled", zh: "折叠滤芯 — 斜视" } },
  { file: "filter-photo-09.jpg", label: { en: "Pleated cartridge — side", zh: "折叠滤芯 — 侧面" } },
  { file: "filter-photo-10.jpg", label: { en: "Pleated cartridge — long", zh: "折叠滤芯 — 长型" } },
  { file: "filter-photo-11.jpg", label: { en: "String-wound cartridge", zh: "线绕滤芯" } },
  { file: "filter-photo-12.jpg", label: { en: "Pleated cartridge — black end cap", zh: "折叠滤芯 — 黑色端盖" } },
  { file: "filter-photo-13.jpg", label: { en: "Pleated cartridge — long", zh: "折叠滤芯 — 长型" } },
  { file: "filter-photo-14.jpg", label: { en: "Pleated cartridge — connector", zh: "折叠滤芯 — 接口" } },
  { file: "filter-photo-15.jpg", label: { en: "Pleated cartridge — vertical", zh: "折叠滤芯 — 竖置" } },
  { file: "filter-photo-16.jpg", label: { en: "Filter housing components", zh: "过滤器壳体组件" } },
  { file: "filter-photo-17.jpg", label: { en: "Filter housing and fittings", zh: "过滤器壳体与配件" } },
  { file: "filter-photo-18.jpg", label: { en: "Pleated cartridge — long", zh: "折叠滤芯 — 长型" } },
  { file: "filter-photo-19.jpg", label: { en: "Large diameter cartridges", zh: "大直径滤芯" } },
  { file: "filter-photo-20.jpg", label: { en: "High-flow cartridge — handle", zh: "大流量滤芯 — 提手" } },
];

/** 图库首页展示用的三张（与首页摄影区一致） */
export const GALLERY_HIGHLIGHTS = [
  "filter-photo-08.jpg",
  "filter-photo-11.jpg",
  "filter-photo-19.jpg",
];
