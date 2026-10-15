/**
 * RO 膜与组件（RO Membranes & Components）—— 本地静态数据源。
 *
 * 2026-10-10 定位调整（客户确认）：站点第二个产品板块。
 *   - 分层：先按类型分（BWRO / ULP / LP / SWRO），再在规格层用 4040 / 8040 做筛选与标注；
 *   - 规格（4040/8040）不进导航层级，只做筛选器选项与型号前缀。
 *
 * 重要约定（与滤芯数据源一致）：
 *   - 客户尚未提供真实型号、参数、认证，本文件**不编造任何 SURMEM 参数**，
 *     所有规格位一律 PENDING 占位，页面以灰色 pending 样式呈现；
 *   - industryPressure 字段是行业同类产品的**公开常见区间**，仅作页面说明用作参考，
 *     已在文案里明确标注「行业参考，非 SURMEM 参数」，不得当作本公司产品参数。
 */
import { FC_PENDING, type FcLocale } from "./fcText";

/** RO 膜类型（板块主干）。 */
export interface RoType {
  slug: string;
  /** 型号前缀，如 BWRO / ULP / LP / SWRO */
  code: string;
  name: string;
  nameZh: string;
  tagline: string;
  taglineZh: string;
  intro: string;
  introZh: string;
  /** 行业常见工作压力（行业参考，不是 SURMEM 参数） */
  industryPressure: string;
  industryPressureZh: string;
}

export const RO_TYPES: RoType[] = [
  {
    slug: "bwro",
    code: "BWRO",
    name: "BWRO — Brackish Water RO Membranes",
    nameZh: "BWRO —— 苦咸水膜元件",
    tagline: "For brackish water and industrial process water where salt rejection matters most",
    taglineZh: "苦咸水与工业工艺水，脱盐率优先的场合",
    intro:
      "Brackish water elements are the workhorse of industrial RO: municipal and process water with elevated TDS where a stable rejection rate matters more than the lowest possible pressure.",
    introZh:
      "苦咸水膜元件是工业 RO 的主力型号：市政水与工艺水含盐量偏高时，看重的是稳定的脱盐率，而不是把压力压到最低。",
    industryPressure: "Industry reference: about 225–255 psi operating pressure",
    industryPressureZh: "行业参考：工作压力约 225–255 psi",
  },
  {
    slug: "ulp",
    code: "ULP",
    name: "ULP — Ultra-Low Pressure RO Membranes",
    nameZh: "ULP —— 超低压膜元件",
    tagline: "Same rejection with the lowest energy demand — municipal and low-pressure systems",
    taglineZh: "脱盐率不降的前提下最省电，适合市政与低压系统",
    intro:
      "Ultra-low pressure elements are chosen when energy cost dominates: they run at low feed pressure and are widely used for municipal water and low-pressure applications.",
    introZh:
      "超低压膜元件用于电费占比高的场合：运行进水压力低，广泛用于市政供水和低压系统。",
    industryPressure: "Industry reference: about 110 psi operating pressure",
    industryPressureZh: "行业参考：工作压力约 110 psi",
  },
  {
    slug: "lp",
    code: "LP",
    name: "LP — Low Pressure RO Membranes",
    nameZh: "LP —— 低压膜元件",
    tagline: "Low pressure without giving up flux — commercial and light industrial duty",
    taglineZh: "压力低但通量不缩水，商用与轻度工业场合",
    intro:
      "Low pressure elements sit between ULP and brackish water: lower energy demand than standard brackish elements, with flux that holds up in continuous duty.",
    introZh:
      "低压膜元件位于超低压与苦咸水之间：比标准苦咸水膜省电，通量在连续运行下仍然站得住。",
    industryPressure: "Industry reference: about 150 psi operating pressure",
    industryPressureZh: "行业参考：工作压力约 150 psi",
  },
  {
    slug: "swro",
    code: "SWRO",
    name: "SWRO — Seawater RO Membranes",
    nameZh: "SWRO —— 海水淡化膜元件",
    tagline: "Built for high-salinity seawater, typically 35,000–45,000 ppm TDS",
    taglineZh: "面向高盐度海水，典型 35,000–45,000 ppm TDS",
    intro:
      "Seawater elements work at high pressure and are engineered for the most demanding desalination duty, where fouling resistance and durability drive the choice.",
    introZh:
      "海水膜元件在高压力下工作，面向最苛刻的海水淡化工况，选型时看的是耐污染与耐久性。",
    industryPressure: "Industry reference: about 800 psi operating pressure",
    industryPressureZh: "行业参考：工作压力约 800 psi",
  },
];

/** 规格代码：只做筛选器选项与型号前缀，不进导航层级。 */
export const RO_SIZE_CODES = ["4040", "8040"] as const;

/** RO 膜规格表字段（对应行业 RO 页面通用表头）。数值待客户提供。 */
export interface RoSpecField {
  key: string;
  label: string;
  labelZh: string;
  /** 该字段为什么必须存在 */
  note: string;
  noteZh: string;
}

export const RO_SPEC_FIELDS: RoSpecField[] = [
  { key: "model", label: "Model", labelZh: "型号", note: "Written as type-size, e.g. BW-4040.", noteZh: "写成「类型-规格」，如 BW-4040。" },
  { key: "membraneType", label: "Membrane type", labelZh: "膜类型", note: "BWRO / ULP / LP / SWRO.", noteZh: "BWRO / ULP / LP / SWRO。" },
  { key: "sizeCode", label: "Size", labelZh: "规格", note: "4040 / 8040 — the filter above the table.", noteZh: "4040 / 8040 —— 表格上方的筛选器。" },
  { key: "activeArea", label: "Active area (ft² / m²)", labelZh: "有效面积（ft² / m²）", note: "Determines how much permeate one element can produce.", noteZh: "决定单支元件能产出多少产水。" },
  { key: "permeateFlow", label: "Average permeate flow (GPD / m³/d)", labelZh: "平均产水量（GPD / m³/d）", note: "Quoted at the test conditions below.", noteZh: "必须连带下方测试条件一起看。" },
  { key: "saltRejection", label: "Salt rejection (%)", labelZh: "脱盐率（%）", note: "Meaningless without the test conditions.", noteZh: "不写测试条件的脱盐率没有可比性。" },
  { key: "recovery", label: "Recovery (%)", labelZh: "回收率（%）", note: "Drives system design and staging.", noteZh: "影响系统设计与段数配置。" },
  { key: "operatingPressure", label: "Operating pressure", labelZh: "操作压力", note: "The pressure the element is rated to run at.", noteZh: "元件设计的运行压力。" },
  { key: "maxPressure", label: "Maximum pressure", labelZh: "最大压力", note: "Ceiling for the element.", noteZh: "元件压力上限。" },
  { key: "testConditions", label: "Test conditions", labelZh: "测试条件", note: "Feed TDS, pressure and temperature used for the numbers above.", noteZh: "上面那些数字对应的进水 TDS、压力与温度。" },
];

/** 膜壳与组件（板块名里的 & Components）字段。 */
export interface RoComponentSpec {
  key: string;
  label: string;
  labelZh: string;
  note: string;
  noteZh: string;
}

export const RO_COMPONENT_SPECS: RoComponentSpec[] = [
  { key: "elementSize", label: "Fits element", labelZh: "适用膜元件", note: "4040 / 8040 — decides fit.", noteZh: "4040 / 8040 —— 决定能不能用。" },
  { key: "elements", label: "Elements per vessel", labelZh: "单壳支数", note: "1, 2 or multi-element.", noteZh: "1 支、2 支或多支。" },
  { key: "material", label: "Material", labelZh: "材质", note: "FRP / SS304 / SS316L.", noteZh: "FRP / SS304 / SS316L。" },
  { key: "pressureRating", label: "Pressure rating", labelZh: "压力等级", note: "300 / 450 / 600 / 1000 psi and so on.", noteZh: "300 / 450 / 600 / 1000 psi 等。" },
  { key: "endStyle", label: "End style", labelZh: "端头形式", note: "End port or side port.", noteZh: "端进端出或侧进侧出。" },
];

/** 取文案（按语言）。 */
export function roText(type: RoType, locale: FcLocale) {
  return locale === "zh"
    ? {
        name: type.nameZh || type.name,
        tagline: type.taglineZh || type.tagline,
        intro: type.introZh || type.intro,
        pressure: type.industryPressureZh || type.industryPressure,
      }
    : {
        name: type.name,
        tagline: type.tagline,
        intro: type.intro,
        pressure: type.industryPressure,
      };
}

/** 规格占位文案（与滤芯页一致的 pending 文案）。 */
export function roPending(locale: FcLocale): string {
  return locale === "zh" ? FC_PENDING.zh : FC_PENDING.en;
}
