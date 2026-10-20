/**
 * 产品目录（系列 + 型号，双语）。
 *
 * 数据来源：客户交付包 SURMEM_V19 的 catalog-data.js（25 条），
 * 逐条搬运，未增删任何参数值；英文原文照录，中文为直译。
 *
 * 用途：
 * - 静态导出时供 generateStaticParams 生成系列页与型号页（output: "export"，
 *   路由清单必须在构建期确定，这就是型号数据必须先内置的原因）；
 * - 后端 /api/v1/filter-cartridges/** 有数据时，页面用水合后的后台数据覆盖；
 *   后台不可达时回退到本文件，页面不会空。
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

/** 系列清单（顺序即产品中心展示顺序） */
export const CATALOG_SERIES: CatalogSeries[] = [
  {
    slug: "high-flow",
    kind: "filter",
    name: { en: "High Flow Filter Cartridges", zh: "大流量滤芯" },
    tagline: {
      en: "Large-format cartridges for process water and high-throughput prefiltration.",
      zh: "用于工艺水与大通量预过滤的大规格滤芯。",
    },
  },
  {
    slug: "pleated",
    kind: "filter",
    name: { en: "Microporous Pleated Filter Cartridges", zh: "微孔折叠滤芯" },
    tagline: {
      en: "Pleated media options for particulate removal in industrial liquids.",
      zh: "面向工业液体颗粒物去除的折叠滤材方案。",
    },
  },
  {
    slug: "multifold",
    kind: "filter",
    name: { en: "Multi-fold Filter Cartridges", zh: "多折滤芯" },
    tagline: {
      en: "High-density pleat packs giving a larger filtration area and longer service life.",
      zh: "高褶密度折叠结构，过滤面积更大，使用周期更长。",
    },
  },
  {
    slug: "pool",
    kind: "filter",
    name: { en: "Pool Filter Cartridges", zh: "泳池滤芯" },
    tagline: {
      en: "Replacement cartridges for pool and spa circulation systems.",
      zh: "用于泳池与按摩浴缸循环系统的替换滤芯。",
    },
  },
  {
    slug: "depth",
    kind: "filter",
    name: { en: "Depth Filter Cartridges", zh: "深层滤芯" },
    tagline: {
      en: "Melt-blown, string-wound and carbon depth cartridges for sediment and adsorption duties.",
      zh: "熔喷、线绕与活性炭深层滤芯，用于拦截与吸附工况。",
    },
  },
  {
    slug: "specialty",
    kind: "filter",
    name: { en: "Specialty Filtration", zh: "特殊过滤产品" },
    tagline: {
      en: "Metal elements and filter bags for specific industrial duties.",
      zh: "面向特定工业工况的金属滤芯与过滤袋。",
    },
  },
  {
    slug: "ro-membranes",
    kind: "ro",
    name: { en: "RO Membrane Elements", zh: "反渗透膜元件" },
    tagline: {
      en: "4-inch and 8-inch elements for low-pressure, brackish water and fouling-resistant duties.",
      zh: "4 英寸与 8 英寸膜元件，覆盖低压、苦咸水与抗污染工况。",
    },
  },
];

/** 滤芯通用询价清单（V19 中 15 款滤芯完全一致，抽成常量避免 15 份重复） */
export const FILTER_CHECKLIST = {
  en: [
    "Required length and outer diameter",
    "Micron rating and filter media",
    "End cap and seal configuration",
    "Operating conditions and target quantity",
  ],
  zh: ["所需长度与外径", "过滤精度与滤材", "端盖与密封形式", "运行条件与目标数量"],
};

/** RO 通用询价清单（V19 中 10 款 RO 完全一致） */
const RO_CHECKLIST = {
  en: [
    "Feed water TDS, temperature and pretreatment",
    "Element size and target permeate flow",
    "Operating pressure, recovery and system design",
    "Required quantity, brand and destination",
  ],
  zh: [
    "进水 TDS、温度与预处理",
    "膜元件规格与目标产水量",
    "运行压力、回收率与系统设计",
    "需求数量、品牌与目的地",
  ],
};

/** 滤芯通用应用说明（V19 中 15 款滤芯完全一致） */
export const FILTER_APPLICATION: Bilingual = {
  en: "Potential applications: industrial process water, pretreatment, and compatible process liquids; selection depends on operating conditions.",
  zh: "可能的应用：工业工艺水、预处理及相容的工艺液体；实际选型取决于运行条件。",
};

/** 滤芯通用核实声明 */
export const FILTER_VERIFICATION: Bilingual = {
  en: "Only listed characteristics verified from accessible supplier pages. Exact grade, dimensions and configurations require model datasheet.",
  zh: "仅核实了厂家公开页面可见的特征。确切的等级、尺寸与配置需以型号数据表为准。",
};

/** RO 通用核实声明 */
const RO_VERIFICATION: Bilingual = {
  en: "Manufacturer English product-page reference. Published data may differ across manufacturer catalog versions; confirm current datasheet and test conditions before order.",
  zh: "取自厂家英文产品页。公开数据可能随厂家目录版本不同而变化；下单前须确认现行数据表与测试条件。",
};

/** 25 个型号 */
export const CATALOG_PRODUCTS: CatalogProduct[] = [
  // ── 大流量 High Flow ──────────────────────────────
  {
    model: "MHF",
    slug: "mhf",
    seriesSlug: "high-flow",
    kind: "filter",
    name: { en: "MHF High Flow Pleated Cartridge", zh: "MHF 大流量折叠滤芯" },
    category: { en: "High Flow", zh: "大流量" },
    spec: {
      en: "PP media; 163.5/166 mm OD; 20/40/60 in",
      zh: "PP 滤材；外径 163.5/166 mm；长度 20/40/60 in",
    },
    summary: {
      en: "High-capacity pleated filtration for industrial process water and high-throughput prefiltration.",
      zh: "大容量折叠过滤，适用于工业工艺水与大通量预过滤。",
    },
    checklist: FILTER_CHECKLIST,
    application: FILTER_APPLICATION,
    technicalNote: {
      en: "Check exact length, outside diameter, handle/connection and replacement housing compatibility.",
      zh: "需核对确切长度、外径、提手/接口形式以及与替换壳体的适配性。",
    },
    verification: FILTER_VERIFICATION,
    sourceUrl: "https://cn.darllyfiltration.com/app/thermal-power-plant",
  },
  {
    model: "MHFB",
    slug: "mhfb",
    seriesSlug: "high-flow",
    kind: "filter",
    name: { en: "MHFB High Flow Cartridge", zh: "MHFB 大流量滤芯" },
    category: { en: "High Flow", zh: "大流量" },
    spec: {
      en: "PP depth filtration; 40/60 in (confirm variants)",
      zh: "PP 深层过滤；长度 40/60 in（规格变体待确认）",
    },
    summary: {
      en: "Large-format polypropylene pleated filtration designed for high-flow applications.",
      zh: "面向大流量工况的大规格聚丙烯折叠过滤产品。",
    },
    checklist: FILTER_CHECKLIST,
    application: FILTER_APPLICATION,
    technicalNote: {
      en: "Reference family: 163.5/166 mm OD; 40/60 in; PP construction; temperature limit 80°C and differential-pressure limits depend on test conditions. Confirm exact SKU.",
      zh: "参考系列：外径 163.5/166 mm；长度 40/60 in；PP 结构；耐温上限 80°C，压差上限取决于测试条件。需确认确切型号。",
    },
    verification: FILTER_VERIFICATION,
    sourceUrl: "https://cn.darllyfiltration.com/app/thermal-power-plant",
  },
  {
    model: "SHF",
    slug: "shf",
    seriesSlug: "high-flow",
    kind: "filter",
    name: { en: "SHF High Flow Pleated Cartridge", zh: "SHF 大流量折叠滤芯" },
    category: { en: "High Flow", zh: "大流量" },
    spec: {
      en: "PP; 154 mm OD; 20/40 in; 80°C max",
      zh: "PP；外径 154 mm；长度 20/40 in；耐温上限 80°C",
    },
    summary: {
      en: "Compact high-flow polypropylene pleated cartridge option for process filtration.",
      zh: "紧凑型大流量聚丙烯折叠滤芯，用于工艺过滤。",
    },
    checklist: FILTER_CHECKLIST,
    application: FILTER_APPLICATION,
    technicalNote: {
      en: "Reference family: 154 mm OD; 20/40 in; maximum temperature 80°C. Confirm exact connection and grade.",
      zh: "参考系列：外径 154 mm；长度 20/40 in；最高温度 80°C。需确认确切接口与等级。",
    },
    verification: FILTER_VERIFICATION,
    sourceUrl: "https://cn.darllyfiltration.com/app/thermal-power-plant",
  },
  {
    model: "HF",
    slug: "hf",
    seriesSlug: "high-flow",
    kind: "filter",
    name: { en: "HF High Flow Cartridge", zh: "HF 大流量滤芯" },
    category: { en: "High Flow", zh: "大流量" },
    spec: {
      en: "Large diameter PP pleated design; verify connection",
      zh: "大直径 PP 折叠结构；接口形式待核实",
    },
    summary: {
      en: "High-flow cartridge family intended to reduce cartridge count in suitable systems.",
      zh: "大流量滤芯系列，在适用系统中可减少滤芯使用数量。",
    },
    checklist: FILTER_CHECKLIST,
    application: FILTER_APPLICATION,
    technicalNote: {
      en: "Confirm housing compatibility, end connections, flow rate and filter area.",
      zh: "需确认壳体适配性、端部接口、流量与过滤面积。",
    },
    verification: FILTER_VERIFICATION,
    sourceUrl: "",
  },
  {
    model: "PHF",
    slug: "phf",
    seriesSlug: "high-flow",
    kind: "filter",
    name: { en: "PHF High Flow Cartridge", zh: "PHF 大流量滤芯" },
    category: { en: "High Flow", zh: "大流量" },
    spec: {
      en: "6.7 in nominal diameter; verify configuration",
      zh: "公称直径 6.7 in；配置待核实",
    },
    summary: {
      en: "Large-diameter high-flow cartridge option for industrial liquid filtration.",
      zh: "大直径大流量滤芯方案，用于工业液体过滤。",
    },
    checklist: FILTER_CHECKLIST,
    application: FILTER_APPLICATION,
    technicalNote: {
      en: "Confirm cartridge dimensions, seal and housing compatibility before interchange.",
      zh: "替换前需确认滤芯尺寸、密封形式与壳体适配性。",
    },
    verification: FILTER_VERIFICATION,
    sourceUrl: "https://cn.darllyfiltration.com/app/thermal-power-plant",
  },
  {
    model: "DHF",
    slug: "dhf",
    seriesSlug: "high-flow",
    kind: "filter",
    name: { en: "DHF High Flow Cartridge", zh: "DHF 大流量滤芯" },
    category: { en: "High Flow", zh: "大流量" },
    spec: {
      en: "Product family; confirm exact specifications",
      zh: "产品系列；确切规格待确认",
    },
    summary: {
      en: "Industrial high-flow cartridge family for bulk liquid filtration.",
      zh: "面向批量液体过滤的工业大流量滤芯系列。",
    },
    checklist: FILTER_CHECKLIST,
    application: FILTER_APPLICATION,
    technicalNote: {
      en: "Exact family specification and model cross-reference require supplier data sheet.",
      zh: "系列的确切规格与型号对照需依据厂家数据表。",
    },
    verification: FILTER_VERIFICATION,
    sourceUrl: "",
  },

  // ── 折叠 Pleated ──────────────────────────────────
  {
    model: "MFF",
    slug: "mff",
    seriesSlug: "pleated",
    kind: "filter",
    name: { en: "MFF Pleated Cartridge", zh: "MFF 折叠滤芯" },
    category: { en: "Pleated", zh: "折叠" },
    spec: {
      en: "Multi-layer media; confirm dimensions and micron grades",
      zh: "多层滤材；尺寸与精度等级待确认",
    },
    summary: {
      en: "Pleated depth-style media option for particulate removal from industrial liquids.",
      zh: "折叠深层滤材方案，用于工业液体颗粒物拦截。",
    },
    checklist: FILTER_CHECKLIST,
    application: FILTER_APPLICATION,
    technicalNote: {
      en: "Confirm media layering, nominal or absolute rating, and available dimensions.",
      zh: "需确认滤材层结构、公称或绝对精度，以及可供尺寸。",
    },
    verification: FILTER_VERIFICATION,
    sourceUrl: "https://cn.darllyfiltration.com/app/thermal-power-plant",
  },
  {
    model: "SGH",
    slug: "sgh",
    seriesSlug: "pleated",
    kind: "filter",
    name: {
      en: "SGH High Dirt-Holding Pleated Cartridge",
      zh: "SGH 高纳污折叠滤芯",
    },
    category: { en: "Pleated", zh: "折叠" },
    spec: {
      en: "Gradient PP fiber structure; verify grade",
      zh: "渐变 PP 纤维结构；等级待核实",
    },
    summary: {
      en: "High dirt-holding pleated cartridge concept for particulate-loaded streams.",
      zh: "高纳污折叠滤芯方案，适用于含颗粒物较高的流体。",
    },
    checklist: FILTER_CHECKLIST,
    application: FILTER_APPLICATION,
    technicalNote: {
      en: "Confirm filtration efficiency, media structure and pressure-drop curves.",
      zh: "需确认过滤效率、滤材结构与压降曲线。",
    },
    verification: FILTER_VERIFICATION,
    sourceUrl: "",
  },
  {
    model: "PP-P",
    slug: "pp-p",
    seriesSlug: "pleated",
    kind: "filter",
    name: { en: "PP Pleated Cartridge", zh: "PP 折叠滤芯" },
    category: { en: "Pleated", zh: "折叠" },
    spec: {
      en: "Polypropylene filtration media; grades on request",
      zh: "聚丙烯滤材；精度等级按需确认",
    },
    summary: {
      en: "Polypropylene pleated cartridge for general liquid prefiltration.",
      zh: "聚丙烯折叠滤芯，用于常规液体预过滤。",
    },
    checklist: FILTER_CHECKLIST,
    application: FILTER_APPLICATION,
    technicalNote: {
      en: "Confirm micron grade, length, end caps, O-ring material and service temperature.",
      zh: "需确认精度等级、长度、端盖、O 型圈材质与使用温度。",
    },
    verification: FILTER_VERIFICATION,
    sourceUrl: "",
  },
  {
    model: "PES",
    slug: "pes",
    seriesSlug: "pleated",
    kind: "filter",
    name: {
      en: "PES Membrane Pleated Cartridge",
      zh: "PES 微孔膜折叠滤芯",
    },
    category: { en: "Pleated", zh: "折叠" },
    spec: {
      en: "PES membrane options subject to supplier confirmation",
      zh: "PES 膜方案，需供应商确认",
    },
    summary: {
      en: "PES membrane pleated cartridge candidate for finer liquid filtration.",
      zh: "PES 微孔膜折叠滤芯方案，用于更高精度的液体过滤。",
    },
    checklist: FILTER_CHECKLIST,
    application: FILTER_APPLICATION,
    technicalNote: {
      en: "Confirm retention validation, integrity test method and chemical compatibility.",
      zh: "需确认截留验证数据、完整性测试方法及化学相容性。",
    },
    verification: FILTER_VERIFICATION,
    sourceUrl: "",
  },

  // ── 深层 Depth ────────────────────────────────────
  {
    model: "PP-MB",
    slug: "pp-mb",
    seriesSlug: "depth",
    kind: "filter",
    name: { en: "PP Melt Blown Cartridge", zh: "PP 熔喷滤芯" },
    category: { en: "Depth", zh: "深层" },
    spec: {
      en: "Depth filtration; dimensions and ratings to confirm",
      zh: "深层过滤；尺寸与精度待确认",
    },
    summary: {
      en: "Melt-blown polypropylene depth cartridge for economical sediment removal.",
      zh: "聚丙烯熔喷深层滤芯，用于经济的沉积物拦截。",
    },
    checklist: FILTER_CHECKLIST,
    application: FILTER_APPLICATION,
    technicalNote: {
      en: "Confirm density profile, micron rating, cartridge size and differential-pressure limits.",
      zh: "需确认密度梯度、过滤精度、滤芯尺寸与压差上限。",
    },
    verification: FILTER_VERIFICATION,
    sourceUrl: "",
  },
  {
    model: "SW",
    slug: "sw",
    seriesSlug: "depth",
    kind: "filter",
    name: { en: "SW String Wound Cartridge", zh: "SW 线绕滤芯" },
    category: { en: "Depth", zh: "深层" },
    spec: {
      en: "String-wound depth cartridge; confirm yarn and core",
      zh: "线绕深层滤芯；纱线与骨架材质待确认",
    },
    summary: {
      en: "String-wound depth cartridge for sediment filtration in compatible liquids.",
      zh: "线绕深层滤芯，用于相容液体中的沉积物过滤。",
    },
    checklist: FILTER_CHECKLIST,
    application: FILTER_APPLICATION,
    technicalNote: {
      en: "Confirm yarn/core material, winding grade and application temperature.",
      zh: "需确认纱线/骨架材质、绕线精度与使用温度。",
    },
    verification: FILTER_VERIFICATION,
    sourceUrl: "",
  },
  {
    model: "AC",
    slug: "ac",
    seriesSlug: "depth",
    kind: "filter",
    name: { en: "Activated Carbon Cartridge", zh: "活性炭滤芯" },
    category: { en: "Depth", zh: "深层" },
    spec: {
      en: "Carbon media and performance to confirm",
      zh: "活性炭滤材与性能待确认",
    },
    summary: {
      en: "Activated carbon cartridge candidate for adsorption-focused water treatment.",
      zh: "活性炭滤芯方案，用于以吸附为主的水处理场景。",
    },
    checklist: FILTER_CHECKLIST,
    application: FILTER_APPLICATION,
    technicalNote: {
      en: "Confirm carbon type, contact time, chlorine reduction claim and certification scope.",
      zh: "需确认活性炭类型、接触时间、余氯去除声明及认证范围。",
    },
    verification: FILTER_VERIFICATION,
    sourceUrl: "",
  },

  // ── 特殊 Specialty ────────────────────────────────
  {
    model: "SS",
    slug: "ss",
    seriesSlug: "specialty",
    kind: "filter",
    name: { en: "Stainless Steel Cartridge", zh: "不锈钢滤芯" },
    category: { en: "Specialty", zh: "特殊用途" },
    spec: {
      en: "Metal filtration element; confirm mesh and metallurgy",
      zh: "金属过滤元件；滤网与材质待确认",
    },
    summary: {
      en: "Stainless-steel cartridge candidate for cleanable industrial filtration.",
      zh: "不锈钢滤芯方案，用于可清洗的工业过滤场景。",
    },
    checklist: FILTER_CHECKLIST,
    application: FILTER_APPLICATION,
    technicalNote: {
      en: "Confirm steel grade, mesh rating, cleaning protocol and connection.",
      zh: "需确认钢材牌号、滤网精度、清洗方式与接口形式。",
    },
    verification: FILTER_VERIFICATION,
    sourceUrl: "",
  },
  {
    model: "BAG",
    slug: "bag",
    seriesSlug: "specialty",
    kind: "filter",
    name: { en: "Filter Bag", zh: "过滤袋" },
    category: { en: "Specialty", zh: "特殊用途" },
    spec: {
      en: "Liquid filtration bag; sizes and materials to confirm",
      zh: "液体过滤袋；尺寸与材质待确认",
    },
    summary: {
      en: "Filter bag candidate for high-volume industrial liquid filtration.",
      zh: "过滤袋方案，用于大流量工业液体过滤。",
    },
    checklist: FILTER_CHECKLIST,
    application: FILTER_APPLICATION,
    technicalNote: {
      en: "Confirm bag size, felt/mesh material, micron rating and ring configuration.",
      zh: "需确认滤袋规格、毡材/网材、过滤精度与环口形式。",
    },
    verification: FILTER_VERIFICATION,
    sourceUrl: "",
  },

  // ── 反渗透 RO ─────────────────────────────────────
  {
    model: "XLP-4040",
    slug: "xlp-4040",
    seriesSlug: "ro-membranes",
    kind: "ro",
    name: {
      en: "SURMEM XLP-4040 RO Membrane Element",
      zh: "SURMEM XLP-4040 反渗透膜元件",
    },
    category: { en: "Extremely Low Pressure", zh: "极低压" },
    spec: {
      en: "Nominal permeate flow: 2,300 GPD; stabilized rejection: 98.5%; minimum rejection: 98.0%; effective area: 85 ft². Values under manufacturer test conditions.",
      zh: "标称产水量 2,300 GPD；稳定脱盐率 98.5%；最低脱盐率 98.0%；有效膜面积 85 ft²。数值基于厂家测试条件。",
    },
    summary: {
      en: "Extremely Low Pressure membrane element reference for low-salinity feed water. Published test performance is for supplier reference only.",
      zh: "极低压膜元件参考型号，适用于低含盐量进水。公布测试性能仅供参考。",
    },
    checklist: RO_CHECKLIST,
    application: { en: "Low-salinity feed water", zh: "低含盐量进水" },
    technicalNote: {
      en: "Published reference test conditions: 500 ppm NaCl / 100 psi. Values can vary by brochure edition and model generation; verify the current datasheet.",
      zh: "公布的参考测试条件：500 ppm NaCl / 100 psi。数值可能随手册版本与型号批次变化；须核实现行数据表。",
    },
    verification: RO_VERIFICATION,
    sourceUrl: "https://www.aromem.com/en_products?id=6.html",
  },
  {
    model: "XLP-8040",
    slug: "xlp-8040",
    seriesSlug: "ro-membranes",
    kind: "ro",
    name: {
      en: "SURMEM XLP-8040 RO Membrane Element",
      zh: "SURMEM XLP-8040 反渗透膜元件",
    },
    category: { en: "Extremely Low Pressure", zh: "极低压" },
    spec: {
      en: "Nominal permeate flow: 9,000 GPD; stabilized rejection: 98.5%; minimum rejection: 98.0%; effective area: 400 ft². Values under manufacturer test conditions.",
      zh: "标称产水量 9,000 GPD；稳定脱盐率 98.5%；最低脱盐率 98.0%；有效膜面积 400 ft²。数值基于厂家测试条件。",
    },
    summary: {
      en: "Extremely Low Pressure membrane element reference for low-salinity feed water. Published test performance is for supplier reference only.",
      zh: "极低压膜元件参考型号，适用于低含盐量进水。公布测试性能仅供参考。",
    },
    checklist: RO_CHECKLIST,
    application: { en: "Low-salinity feed water", zh: "低含盐量进水" },
    technicalNote: {
      en: "Published reference test conditions: 500 ppm NaCl / 100 psi. Values can vary by brochure edition and model generation; verify the current datasheet.",
      zh: "公布的参考测试条件：500 ppm NaCl / 100 psi。数值可能随手册版本与型号批次变化；须核实现行数据表。",
    },
    verification: RO_VERIFICATION,
    sourceUrl: "https://www.aromem.com/en_products?id=6.html",
  },
  {
    model: "ULP-4040",
    slug: "ulp-4040",
    seriesSlug: "ro-membranes",
    kind: "ro",
    name: {
      en: "SURMEM ULP-4040 RO Membrane Element",
      zh: "SURMEM ULP-4040 反渗透膜元件",
    },
    category: { en: "Ultra Low Pressure", zh: "超低压" },
    spec: {
      en: "Nominal permeate flow: 2,600 GPD; stabilized rejection: 99.2%; minimum rejection: 99.0%; effective area: 85 ft². Values under manufacturer test conditions.",
      zh: "标称产水量 2,600 GPD；稳定脱盐率 99.2%；最低脱盐率 99.0%；有效膜面积 85 ft²。数值基于厂家测试条件。",
    },
    summary: {
      en: "Ultra Low Pressure membrane element reference for low-pressure brackish feed. Published test performance is for supplier reference only.",
      zh: "超低压膜元件参考型号，适用于低压苦咸水进水。公布测试性能仅供参考。",
    },
    checklist: RO_CHECKLIST,
    application: { en: "Low-pressure brackish feed", zh: "低压苦咸水进水" },
    technicalNote: {
      en: "Published reference test conditions: 1500 ppm NaCl; check exact generation. Values can vary by brochure edition and model generation; verify the current datasheet.",
      zh: "公布的参考测试条件：1500 ppm NaCl；需核对具体批次。数值可能随手册版本与型号批次变化；须核实现行数据表。",
    },
    verification: RO_VERIFICATION,
    sourceUrl: "https://aromem.com/en_products?id=8.html",
  },
  {
    model: "ULP-8040",
    slug: "ulp-8040",
    seriesSlug: "ro-membranes",
    kind: "ro",
    name: {
      en: "SURMEM ULP-8040 RO Membrane Element",
      zh: "SURMEM ULP-8040 反渗透膜元件",
    },
    category: { en: "Ultra Low Pressure", zh: "超低压" },
    spec: {
      en: "Nominal permeate flow: 12,000 GPD; stabilized rejection: 99.2%; minimum rejection: 99.0%; effective area: 400 ft². Values under manufacturer test conditions.",
      zh: "标称产水量 12,000 GPD；稳定脱盐率 99.2%；最低脱盐率 99.0%；有效膜面积 400 ft²。数值基于厂家测试条件。",
    },
    summary: {
      en: "Ultra Low Pressure membrane element reference for low-pressure brackish feed. Published test performance is for supplier reference only.",
      zh: "超低压膜元件参考型号，适用于低压苦咸水进水。公布测试性能仅供参考。",
    },
    checklist: RO_CHECKLIST,
    application: { en: "Low-pressure brackish feed", zh: "低压苦咸水进水" },
    technicalNote: {
      en: "Published reference test conditions: 1500 ppm NaCl / 150 psi. Values can vary by brochure edition and model generation; verify the current datasheet.",
      zh: "公布的参考测试条件：1500 ppm NaCl / 150 psi。数值可能随手册版本与型号批次变化；须核实现行数据表。",
    },
    verification: RO_VERIFICATION,
    sourceUrl: "https://aromem.com/en_products?id=8.html",
  },
  {
    model: "ULP-4040HR",
    slug: "ulp-4040hr",
    seriesSlug: "ro-membranes",
    kind: "ro",
    name: {
      en: "SURMEM ULP-4040HR RO Membrane Element",
      zh: "SURMEM ULP-4040HR 反渗透膜元件",
    },
    category: { en: "Ultra Low Pressure", zh: "超低压" },
    spec: {
      en: "Nominal permeate flow: 2,400 GPD; stabilized rejection: 99.4%; minimum rejection: 99.2%; effective area: 85 ft². Values under manufacturer test conditions.",
      zh: "标称产水量 2,400 GPD；稳定脱盐率 99.4%；最低脱盐率 99.2%；有效膜面积 85 ft²。数值基于厂家测试条件。",
    },
    summary: {
      en: "Ultra Low Pressure membrane element reference for higher rejection option. Published test performance is for supplier reference only.",
      zh: "超低压膜元件参考型号，提供更高脱盐率选项。公布测试性能仅供参考。",
    },
    checklist: RO_CHECKLIST,
    application: { en: "Higher rejection option", zh: "更高脱盐率选项" },
    technicalNote: {
      en: "Published reference test conditions: 1500 ppm NaCl; 2024 brochure. Values can vary by brochure edition and model generation; verify the current datasheet.",
      zh: "公布的参考测试条件：1500 ppm NaCl；参考 2024 版手册。数值可能随手册版本与型号批次变化；须核实现行数据表。",
    },
    verification: RO_VERIFICATION,
    sourceUrl: "https://aromem.com/en_products?id=8.html",
  },
  {
    model: "ULP-8040HR",
    slug: "ulp-8040hr",
    seriesSlug: "ro-membranes",
    kind: "ro",
    name: {
      en: "SURMEM ULP-8040HR RO Membrane Element",
      zh: "SURMEM ULP-8040HR 反渗透膜元件",
    },
    category: { en: "Ultra Low Pressure", zh: "超低压" },
    spec: {
      en: "Nominal permeate flow: 10,500 GPD; stabilized rejection: 99.4%; minimum rejection: 99.2%; effective area: 400 ft². Values under manufacturer test conditions.",
      zh: "标称产水量 10,500 GPD；稳定脱盐率 99.4%；最低脱盐率 99.2%；有效膜面积 400 ft²。数值基于厂家测试条件。",
    },
    summary: {
      en: "Ultra Low Pressure membrane element reference for higher rejection option. Published test performance is for supplier reference only.",
      zh: "超低压膜元件参考型号，提供更高脱盐率选项。公布测试性能仅供参考。",
    },
    checklist: RO_CHECKLIST,
    application: { en: "Higher rejection option", zh: "更高脱盐率选项" },
    technicalNote: {
      en: "Published reference test conditions: 1500 ppm NaCl / 150 psi. Values can vary by brochure edition and model generation; verify the current datasheet.",
      zh: "公布的参考测试条件：1500 ppm NaCl / 150 psi。数值可能随手册版本与型号批次变化；须核实现行数据表。",
    },
    verification: RO_VERIFICATION,
    sourceUrl: "https://aromem.com/en_products?id=8.html",
  },
  {
    model: "BW-4040",
    slug: "bw-4040",
    seriesSlug: "ro-membranes",
    kind: "ro",
    name: {
      en: "SURMEM BW-4040 RO Membrane Element",
      zh: "SURMEM BW-4040 反渗透膜元件",
    },
    category: { en: "Brackish Water", zh: "苦咸水" },
    spec: {
      en: "Nominal permeate flow: 2,500 GPD; stabilized rejection: 99.5%; minimum rejection: 99.3%; effective area: 85 ft². Values under manufacturer test conditions.",
      zh: "标称产水量 2,500 GPD；稳定脱盐率 99.5%；最低脱盐率 99.3%；有效膜面积 85 ft²。数值基于厂家测试条件。",
    },
    summary: {
      en: "Brackish Water membrane element reference for brackish water treatment. Published test performance is for supplier reference only.",
      zh: "苦咸水膜元件参考型号，用于苦咸水处理。公布测试性能仅供参考。",
    },
    checklist: RO_CHECKLIST,
    application: { en: "Brackish water treatment", zh: "苦咸水处理" },
    technicalNote: {
      en: "Published reference test conditions: 2000 ppm NaCl / 225 psi. Values can vary by brochure edition and model generation; verify the current datasheet.",
      zh: "公布的参考测试条件：2000 ppm NaCl / 225 psi。数值可能随手册版本与型号批次变化；须核实现行数据表。",
    },
    verification: RO_VERIFICATION,
    sourceUrl: "https://aromem.com/en_products?id=10.html",
  },
  {
    model: "BW-8040",
    slug: "bw-8040",
    seriesSlug: "ro-membranes",
    kind: "ro",
    name: {
      en: "SURMEM BW-8040 RO Membrane Element",
      zh: "SURMEM BW-8040 反渗透膜元件",
    },
    category: { en: "Brackish Water", zh: "苦咸水" },
    spec: {
      en: "Nominal permeate flow: 10,500 GPD; stabilized rejection: 99.5%; minimum rejection: 99.3%; effective area: 400 ft². Values under manufacturer test conditions.",
      zh: "标称产水量 10,500 GPD；稳定脱盐率 99.5%；最低脱盐率 99.3%；有效膜面积 400 ft²。数值基于厂家测试条件。",
    },
    summary: {
      en: "Brackish Water membrane element reference for brackish water treatment. Published test performance is for supplier reference only.",
      zh: "苦咸水膜元件参考型号，用于苦咸水处理。公布测试性能仅供参考。",
    },
    checklist: RO_CHECKLIST,
    application: { en: "Brackish water treatment", zh: "苦咸水处理" },
    technicalNote: {
      en: "Published reference test conditions: 2000 ppm NaCl / 225 psi. Values can vary by brochure edition and model generation; verify the current datasheet.",
      zh: "公布的参考测试条件：2000 ppm NaCl / 225 psi。数值可能随手册版本与型号批次变化；须核实现行数据表。",
    },
    verification: RO_VERIFICATION,
    sourceUrl: "https://aromem.com/en_products?id=10.html",
  },
  {
    model: "BW-4040FR",
    slug: "bw-4040fr",
    seriesSlug: "ro-membranes",
    kind: "ro",
    name: {
      en: "SURMEM BW-4040FR RO Membrane Element",
      zh: "SURMEM BW-4040FR 反渗透膜元件",
    },
    category: { en: "Fouling Resistant", zh: "抗污染" },
    spec: {
      en: "Nominal permeate flow: 2,300 GPD; stabilized rejection: 99.5%; minimum rejection: 99.3%; effective area: 85 ft². Values under manufacturer test conditions.",
      zh: "标称产水量 2,300 GPD；稳定脱盐率 99.5%；最低脱盐率 99.3%；有效膜面积 85 ft²。数值基于厂家测试条件。",
    },
    summary: {
      en: "Fouling Resistant membrane element reference for fouling-prone feed. Published test performance is for supplier reference only.",
      zh: "抗污染膜元件参考型号，适用于易结垢污染进水。公布测试性能仅供参考。",
    },
    checklist: RO_CHECKLIST,
    application: { en: "Fouling-prone feed", zh: "易污染进水" },
    technicalNote: {
      en: "Published reference test conditions: 2000 ppm NaCl; 2024 brochure. Values can vary by brochure edition and model generation; verify the current datasheet.",
      zh: "公布的参考测试条件：2000 ppm NaCl；参考 2024 版手册。数值可能随手册版本与型号批次变化；须核实现行数据表。",
    },
    verification: RO_VERIFICATION,
    sourceUrl: "https://aromem.com/en_products?id=10.html",
  },
  {
    model: "BW-8040FR",
    slug: "bw-8040fr",
    seriesSlug: "ro-membranes",
    kind: "ro",
    name: {
      en: "SURMEM BW-8040FR RO Membrane Element",
      zh: "SURMEM BW-8040FR 反渗透膜元件",
    },
    category: { en: "Fouling Resistant", zh: "抗污染" },
    spec: {
      en: "Nominal permeate flow: 9,500 GPD; stabilized rejection: 99.5%; minimum rejection: 99.3%; effective area: 400 ft². Values under manufacturer test conditions.",
      zh: "标称产水量 9,500 GPD；稳定脱盐率 99.5%；最低脱盐率 99.3%；有效膜面积 400 ft²。数值基于厂家测试条件。",
    },
    summary: {
      en: "Fouling Resistant membrane element reference for fouling-prone feed. Published test performance is for supplier reference only.",
      zh: "抗污染膜元件参考型号，适用于易结垢污染进水。公布测试性能仅供参考。",
    },
    checklist: RO_CHECKLIST,
    application: { en: "Fouling-prone feed", zh: "易污染进水" },
    technicalNote: {
      en: "Published reference test conditions: 2000 ppm NaCl / 225 psi. Values can vary by brochure edition and model generation; verify the current datasheet.",
      zh: "公布的参考测试条件：2000 ppm NaCl / 225 psi。数值可能随手册版本与型号批次变化；须核实现行数据表。",
    },
    verification: RO_VERIFICATION,
    sourceUrl: "https://aromem.com/en_products?id=10.html",
  },
];

/* ── 查询工具（页面与 generateStaticParams 共用） ────────── */

export function getSeries(slug: string): CatalogSeries | undefined {
  return CATALOG_SERIES.find((s) => s.slug === slug);
}

export function getProductsBySeries(seriesSlug: string): CatalogProduct[] {
  return CATALOG_PRODUCTS.filter((p) => p.seriesSlug === seriesSlug);
}

export function getProduct(
  seriesSlug: string,
  modelSlug: string,
): CatalogProduct | undefined {
  return CATALOG_PRODUCTS.find(
    (p) => p.seriesSlug === seriesSlug && p.slug === modelSlug,
  );
}

/** 该系列 slug 是否在本地清单内（决定系列卡是否可直接跳系列页） */
export function hasSeries(slug: string): boolean {
  return CATALOG_SERIES.some((s) => s.slug === slug);
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
