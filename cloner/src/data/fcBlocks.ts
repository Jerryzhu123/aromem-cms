/**
 * 新增大区块的专用文案（能力区 / 为什么选 SURMEM / 底部询价 / 画廊 / 规格书 / 国家字段）。
 *
 * 与 fcText.ts 的分工：fcText 放全站共用的界面短文案（按钮、表头、状态…），
 * 这里放页面级区块的成段文案与列表数据，依然是中英成对、不散落在组件里。
 */
import { FC_PRODUCTS } from "@/data/filterCartridges";
import { isPending, type FcLocale } from "@/data/fcText";

export const FC_BLOCKS = {
  en: {
    capability: {
      title: "Product line capability",
      intro:
        "Ranges below are aggregated from the model library, so they update themselves as soon as the specification table is loaded from the CMS.",
      labels: {
        media: "Media material",
        micron: "Micron rating range",
        length: "Overall length",
        diameter: "Outside diameter",
        endCap: "End cap / connection",
        flow: "Flow rate",
        industries: "Application industries",
      },
    },
    why: {
      title: "Why SURMEM",
      items: [
        {
          title: "Documentation first",
          body: "One datasheet per model, drawings on request with the quote — your engineering team can approve without a sample round trip.",
        },
        {
          title: "OEM & custom",
          body: "Non-standard length, media and end caps are quoted case by case. Send the housing and the operating conditions.",
        },
        {
          title: "Capacity & lead time",
          body: "Capacity, stock and lead-time commitments are published here only after the factory confirms them — no invented numbers.",
        },
        {
          title: "Export support",
          body: "Incoterms, packing list, datasheets and drawings are prepared alongside the quote, so customs and engineering get the same file set.",
        },
      ],
    },
    inquiry: {
      title: "Not sure which model fits?",
      intro:
        "Four fields are enough to start: name, company, work email and the part number. Distributor enquiries go to our export desk first.",
      moreFields: "Add quantity, destination and lead time",
      note: "Your details are used only to answer this enquiry.",
      submit: "Request a Quote",
      sending: "Sending…",
    },
    gallery: {
      enlarge: "Click to enlarge",
      close: "Close",
      pendingThumbs: "Thumbnails appear once the image library is loaded from the CMS.",
    },
    datasheet: {
      download: "Download Datasheet (PDF)",
      pending: "Datasheet pending client upload",
      none: "No datasheet published yet",
    },
    certs: {
      hidden:
        "Certifications are shown per model, and only once the certificate is supplied by the factory and cleared for marketing use.",
    },
    spec: { unitNote: "Imperial · Metric" },
    country: { label: "Country / Region", placeholder: "Select…" },
  },

  zh: {
    capability: {
      title: "产品线能力",
      intro: "下表区间由型号库自动汇总；规格表从 CMS 入库后，这里的数值会自动更新。",
      labels: {
        media: "滤材",
        micron: "过滤精度区间",
        length: "总长",
        diameter: "外径",
        endCap: "端盖 / 接口",
        flow: "流量",
        industries: "应用行业",
      },
    },
    why: {
      title: "为什么选苏瑞膜",
      items: [
        {
          title: "资料先行",
          body: "每个型号一份规格书，图纸随报价提供——工程部不用先要样品就能完成选型审批。",
        },
        {
          title: "OEM 与定制",
          body: "非标长度、滤材与端盖按单评估。把滤壳型号与工况发给我们即可。",
        },
        {
          title: "产能与交期",
          body: "产能、库存与交期承诺只写厂房确认过的数字，不虚构数据。",
        },
        {
          title: "出口资料支持",
          body: "贸易条款、装箱单、规格书与图纸随报价一并出，报关与工程拿到的是同一套文件。",
        },
      ],
    },
    inquiry: {
      title: "不确定选哪个型号？",
      intro: "四个字段就能开始：姓名、公司、工作邮箱和型号。经销商询价会优先转到出口部。",
      moreFields: "补充数量、目的港与交期",
      note: "这些信息仅用于回复本次询价。",
      submit: "获取报价",
      sending: "提交中…",
    },
    gallery: {
      enlarge: "点击放大",
      close: "关闭",
      pendingThumbs: "缩略图将在图库从 CMS 入库后显示。",
    },
    datasheet: {
      download: "下载规格书（PDF）",
      pending: "规格书待客户上传",
      none: "暂未发布规格书",
    },
    certs: {
      hidden: "认证按型号展示，且仅在厂房提供证书并获准对外使用后才会出现。",
    },
    spec: { unitNote: "公制 · 英制" },
    country: { label: "国家 / 地区", placeholder: "请选择…" },
  },
};

export function fcBlocks(locale: FcLocale = "en") {
  return FC_BLOCKS[locale] ?? FC_BLOCKS.en;
}

/** 国家 / 地区清单：值固定用 ISO 代码，中英文只换显示名。 */
export interface FcCountry {
  code: string;
  en: string;
  zh: string;
}

export const FC_COUNTRIES: FcCountry[] = [
  { code: "US", en: "United States", zh: "美国" },
  { code: "CA", en: "Canada", zh: "加拿大" },
  { code: "MX", en: "Mexico", zh: "墨西哥" },
  { code: "BR", en: "Brazil", zh: "巴西" },
  { code: "CL", en: "Chile", zh: "智利" },
  { code: "GB", en: "United Kingdom", zh: "英国" },
  { code: "DE", en: "Germany", zh: "德国" },
  { code: "FR", en: "France", zh: "法国" },
  { code: "NL", en: "Netherlands", zh: "荷兰" },
  { code: "BE", en: "Belgium", zh: "比利时" },
  { code: "ES", en: "Spain", zh: "西班牙" },
  { code: "IT", en: "Italy", zh: "意大利" },
  { code: "PL", en: "Poland", zh: "波兰" },
  { code: "SE", en: "Sweden", zh: "瑞典" },
  { code: "NO", en: "Norway", zh: "挪威" },
  { code: "FI", en: "Finland", zh: "芬兰" },
  { code: "DK", en: "Denmark", zh: "丹麦" },
  { code: "IE", en: "Ireland", zh: "爱尔兰" },
  { code: "PT", en: "Portugal", zh: "葡萄牙" },
  { code: "CZ", en: "Czech Republic", zh: "捷克" },
  { code: "AT", en: "Austria", zh: "奥地利" },
  { code: "CH", en: "Switzerland", zh: "瑞士" },
  { code: "TR", en: "Turkey", zh: "土耳其" },
  { code: "RU", en: "Russia", zh: "俄罗斯" },
  { code: "AE", en: "United Arab Emirates", zh: "阿聅酋" },
  { code: "SA", en: "Saudi Arabia", zh: "沙特阿拉伯" },
  { code: "EG", en: "Egypt", zh: "埃及" },
  { code: "ZA", en: "South Africa", zh: "南非" },
  { code: "IN", en: "India", zh: "印度" },
  { code: "PK", en: "Pakistan", zh: "巴基斯坦" },
  { code: "BD", en: "Bangladesh", zh: "孟加拉国" },
  { code: "LK", en: "Sri Lanka", zh: "斯里兰卡" },
  { code: "TH", en: "Thailand", zh: "泰国" },
  { code: "VN", en: "Vietnam", zh: "越南" },
  { code: "MY", en: "Malaysia", zh: "马来西亚" },
  { code: "SG", en: "Singapore", zh: "新加坡" },
  { code: "ID", en: "Indonesia", zh: "印度尼西亚" },
  { code: "PH", en: "Philippines", zh: "菲律宾" },
  { code: "KR", en: "South Korea", zh: "韩国" },
  { code: "JP", en: "Japan", zh: "日本" },
  { code: "AU", en: "Australia", zh: "澳大利亚" },
  { code: "NZ", en: "New Zealand", zh: "新西兰" },
  { code: "CN", en: "China", zh: "中国" },
  { code: "TW", en: "Taiwan (China)", zh: "中国台湾" },
  { code: "HK", en: "Hong Kong (China)", zh: "中国香港" },
  { code: "OTHER", en: "Other / not listed", zh: "其他 / 未列出" },
];

/** 按语言给出国家下拉选项（值保持 ISO 代码）。 */
export function countryOptions(locale: FcLocale = "en") {
  return FC_COUNTRIES.map((item) => ({
    value: item.code,
    label: locale === "zh" ? item.zh : item.en,
  }));
}

export interface FcCapabilityRow {
  label: string;
  value: string;
}

/**
 * 能力区数值：能从型号库汇总就汇总，汇总不出（客户参数未到）就标占位，不编造。
 */
export function fcCapabilityRows(locale: FcLocale = "en"): FcCapabilityRow[] {
  const b = fcBlocks(locale);
  const pendingText = locale === "zh" ? "待客户提供资料" : "Awaiting client data";
  const real = (arr: string[]) => arr.filter((v) => !isPending(v));
  const uniq = (arr: string[]) => Array.from(new Set(arr));

  function numRange(values: string[], unit: string): string {
    const nums = values
      .map((v) => Number(String(v).replace(/[^0-9.]/g, "")))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (!nums.length) return pendingText;
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const fmt = (n: number) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10));
    return min === max ? `${fmt(min)} ${unit}` : `${fmt(min)}–${fmt(max)} ${unit}`;
  }

  const media = uniq(real(FC_PRODUCTS.flatMap((p) => p.mediaMaterial)));
  const endCaps = uniq(real(FC_PRODUCTS.map((p) => p.endCap)));
  const industries = uniq(real(FC_PRODUCTS.flatMap((p) => p.applicationIndustries)));

  return [
    { label: b.capability.labels.media, value: media.length ? media.join(" / ") : pendingText },
    {
      label: b.capability.labels.micron,
      value: numRange(FC_PRODUCTS.map((p) => p.micronAbsolute), "µm"),
    },
    {
      label: b.capability.labels.length,
      value: numRange(
        FC_PRODUCTS.map((p) => p.overallLength),
        FC_PRODUCTS[0]?.overallLengthUnit ?? "in",
      ),
    },
    {
      label: b.capability.labels.diameter,
      value: numRange(
        FC_PRODUCTS.map((p) => p.outsideDiameter),
        FC_PRODUCTS[0]?.outsideDiameterUnit ?? "in",
      ),
    },
    { label: b.capability.labels.endCap, value: endCaps.length ? endCaps.join(" / ") : pendingText },
    {
      label: b.capability.labels.flow,
      value: numRange(FC_PRODUCTS.map((p) => p.flowRateMax), FC_PRODUCTS[0]?.flowRateUnit ?? "GPM"),
    },
    {
      label: b.capability.labels.industries,
      value: industries.length ? industries.join(" / ") : pendingText,
    },
  ];
}
