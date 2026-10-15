/**
 * 滤芯产品线的中英文界面文案字典。
 *
 * 为什么单独放一个文件：
 *  - 页面与组件（FcShell / 产品卡片 / 规格表 / 筛选器 / 表单…）全部共用一套结构，
 *    只有文案不同；把文案集中到一处，中英双站就不会出现「改了英文忘了中文」；
 *  - 所有文案字段均为纯文本，不含 JSX，便于后续整体搬到 CMS 的多语言字段。
 *
 * 命名约定：字典键使用 ASCII，中文只出现在值里。
 */

export type FcLocale = "en" | "zh";

/** 规格位占位文案：客户尚未提供参数时，页面统一显示这个值（灰色样式）。 */
export const FC_PENDING: Record<FcLocale, string> = {
  en: "Awaiting client data",
  zh: "待客户提供资料",
};

const PENDING_VALUES = new Set([FC_PENDING.en, FC_PENDING.zh]);

/** 统一判断一个字段是不是「占位」值，避免中英文站点各判各的。 */
export function isPending(value?: string | null): boolean {
  if (value === undefined || value === null) return true;
  const trimmed = value.trim();
  return trimmed === "" || PENDING_VALUES.has(trimmed);
}

/** 兼容性免责声明（中英文都必须展示）。 */
export const FC_COMPAT_DISCLAIMER: Record<FcLocale, string> = {
  en: "Cross-reference information is provided as a guide only. SURMEM replacement cartridges are not manufactured by, endorsed by or affiliated with the original equipment manufacturers named above. Verify dimensions, media and end-cap style against the original part before ordering.",
  zh: "型号对照信息仅供参考。苏瑞膜（SURMEM）的替代滤芯并非由上述原厂制造，也未获得原厂认可或授权。下单前请按原件核对尺寸、滤材与端盖形式。",
};

export const FC_TEXT = {
  en: {
    lang: "en" as FcLocale,
    htmlLang: "en",
    powerLine: "SURMEM Industrial Filter Cartridges",
    pending: FC_PENDING.en,
    previewNotice:
      "Structure preview — product data, certifications and cross-reference mappings are pending client input.",
    homeCrumb: "Home",
    productsCrumb: "Products",
    fcCrumb: "Filter Cartridges",

    requestQuote: "Request a Quote",
    requestSample: "Request a Sample",
    sample: "Sample",
    details: "Details",
    viewProduct: "View product",
    viewSeries: "View series",
    crossRefTool: "Cross-Reference Tool",
    crossRefCheckTool: "check the tool",
    crossRefThisModel: "Cross-reference this model",

    card: {
      micronAbs: "Micron (abs.)",
      length: "Length",
      od: "Outside dia.",
      endCap: "End cap",
      crossRefPrefix: "Cross-ref:",
      crossRefCount: (n: number) => `${n} mapped part numbers —`,
      crossRefPending: "Cross-reference data pending",
    },

    spec: {
      caption: "Product specifications",
      model: "Model",
      series: "Series",
      micronAbs: "Micron rating (absolute)",
      micronNom: "Micron rating (nominal)",
      media: "Media material",
      overallLength: "Overall length",
      od: "Outside diameter",
      id: "Inner diameter",
      endCap: "End cap / connection",
      connection: "Connection detail",
      flow: "Flow rate",
      maxTemp: "Max. temperature",
      deltaP: "Recommended change-out ΔP",
      industries: "Application industries",
      certs: "Certifications",
      certsNone: "Not published — pending client certificates",
    },

    compat: {
      empty: "Cross-reference mapping for this model is pending client input.",
      brand: "OEM brand",
      oem: "OEM part number",
      relation: "Relationship",
      note: "Note",
      disclaimer: FC_COMPAT_DISCLAIMER.en,
      relationLabels: {
        "direct replacement": "direct replacement",
        compatible: "compatible",
        "similar spec": "similar spec",
      } as Record<string, string>,
    },

    docs: {
      empty: "No documents published yet.",
      lang: "Lang",
      rev: "Rev",
      download: "Download",
      file: "File",
      pendingFile: "File pending client upload",
      types: {
        datasheet: "Datasheet",
        drawing: "Drawing",
        certificate: "Certificate",
        manual: "Manual",
      } as Record<string, string>,
    },

    browser: {
      searchPlaceholder: "Search this series by model or OEM part number",
      searchLabel: "Search products in this series",
      allMedia: "All media material",
      allEndCaps: "All end caps",
      sortLabel: "Sort",
      sortAZ: "Model A → Z",
      sortZA: "Model Z → A",
      micronRange: "Micron range (min – max)",
      lengthRange: "Length range",
      odRange: "Outside diameter range",
      flowRange: "Flow rate range",
      facetsPrefix: "Facets: ",
      numericHint: " · Numeric ranges activate once the specification table is loaded from the CMS.",
      count: (visible: number, total: number) => `${visible} of ${total} models`,
      empty:
        "No model in this series matches the current filters. Tell us the part number you are replacing and we will cross-reference it manually —",
    },

    quote: {
      inputPlaceholder: "Competitor or SURMEM part number",
      inputLabel: "Part number to cross-reference",
      allBrands: "All brands",
      emptyPrompt:
        "Enter the part number you are running today. We list the matching SURMEM model and how closely it matches the original specification.",
      thSurmem: "SURMEM model",
      thBrand: "OEM brand",
      thOem: "OEM part number",
      thRelation: "Relationship",
      noMatchPrefix: "No match for",
      noMatchTail:
        "Our cross-reference table is being populated. Send us the part number and we will map it manually —",
      noMatchLink: "Request a Quote with this part number pre-filled",
      disclaimer: FC_COMPAT_DISCLAIMER.en,
    },

    form: {
      fullName: "Full name",
      company: "Company",
      workEmail: "Work email",
      phone: "Phone",
      accountType: "I am a",
      select: "Select…",
      distributor: "Distributor / trader",
      endUser: "End user / project",
      monthlyVolume: "Monthly volume",
      monthlyVolumePh: "e.g. 200 pcs / month",
      industry: "Industry",
      partNumber: "Part number / model",
      partNumberPh: "SURMEM model or the part you are replacing",
      quantity: "Quantity",
      targetMicron: "Target micron rating",
      targetMicronPh: "e.g. 5 µm absolute",
      leadTime: "Required lead time",
      leadTimeOptions: ["Select…", "Standard", "Expedited", "Not urgent — best price"],
      application: "Application",
      applicationPh: "Housing, feed water, process…",
      message: "Message",
      attachment: "Attachment",
      attachmentHint:
        "File upload turns on with the RFQ endpoint — until then, email the drawing or photo to sales@aromem.com with your company name.",
      submitQuote: "Request a Quote",
      submitSample: "Request a Sample",
      sending: "Sending…",
      privacy: "Your details are used only to answer this enquiry.",
      done: "Your request has been received. Our export desk will reply with pricing and availability.",
      errorPrefix: "We could not submit the form automatically",
      errorTail: "Nothing was lost — please send it by email and we will treat it as an official enquiry:",
      mailtoSubjectQuote: "Quote request — filter cartridges",
      mailtoSubjectSample: "Sample request — filter cartridges",
      industries: [
        "Water treatment / RO pre-treatment",
        "Power generation",
        "Iron & steel",
        "Fine chemical",
        "Food & beverage",
        "Pharmaceutical",
        "Microelectronics",
        "Other",
      ],
    },
  },

  zh: {
    lang: "zh" as FcLocale,
    htmlLang: "zh-CN",
    powerLine: "苏瑞膜工业滤芯",
    pending: FC_PENDING.zh,
    previewNotice:
      "结构演示页——产品参数、认证与型号对照数据待客户提供后替换。",
    homeCrumb: "首页",
    productsCrumb: "产品中心",
    fcCrumb: "工业滤芯",

    requestQuote: "获取报价",
    requestSample: "申请样品",
    sample: "样品",
    details: "查看详情",
    viewProduct: "查看产品",
    viewSeries: "进入系列",
    crossRefTool: "型号对照工具",
    crossRefCheckTool: "去对照工具查",
    crossRefThisModel: "对照该型号",

    card: {
      micronAbs: "过滤精度（绝对）",
      length: "总长",
      od: "外径",
      endCap: "端盖",
      crossRefPrefix: "型号对照：",
      crossRefCount: (n: number) => `已收录 ${n} 个可对照型号 —`,
      crossRefPending: "型号对照数据待补充",
    },

    spec: {
      caption: "产品规格参数",
      model: "型号",
      series: "所属系列",
      micronAbs: "过滤精度（绝对）",
      micronNom: "过滤精度（名义）",
      media: "滤材",
      overallLength: "总长",
      od: "外径",
      id: "内径",
      endCap: "端盖 / 接口",
      connection: "接口形式",
      flow: "流量",
      maxTemp: "最高使用温度",
      deltaP: "建议更换压差",
      industries: "应用行业",
      certs: "认证",
      certsNone: "暂未公布——证书待客户提供",
    },

    compat: {
      empty: "该型号的可替代/兼容型号对照数据待客户提供。",
      brand: "原厂品牌",
      oem: "原厂型号",
      relation: "关系",
      note: "说明",
      disclaimer: FC_COMPAT_DISCLAIMER.zh,
      relationLabels: {
        "direct replacement": "直接替代",
        compatible: "兼容",
        "similar spec": "规格相近",
      } as Record<string, string>,
    },

    docs: {
      empty: "暂无已发布的文档。",
      lang: "语言",
      rev: "版本",
      download: "下载",
      file: "文件",
      pendingFile: "文件待客户上传",
      types: {
        datasheet: "规格书",
        drawing: "图纸",
        certificate: "证书",
        manual: "手册",
      } as Record<string, string>,
    },

    browser: {
      searchPlaceholder: "输入本系列型号或原厂型号检索",
      searchLabel: "在本系列内检索产品",
      allMedia: "全部滤材",
      allEndCaps: "全部端盖",
      sortLabel: "排序",
      sortAZ: "型号 A → Z",
      sortZA: "型号 Z → A",
      micronRange: "过滤精度区间（最小 – 最大）",
      lengthRange: "长度区间",
      odRange: "外径区间",
      flowRange: "流量区间",
      facetsPrefix: "可筛选维度：",
      numericHint: " · 参数填入库后，区间筛选自动启用。",
      count: (visible: number, total: number) =>
        `共 ${total} 个型号，当前显示 ${visible} 个`,
      empty:
        "当前筛选条件下本系列没有匹配型号。把你正在用的型号告诉我们，我们手工帮你对照 —",
    },

    quote: {
      inputPlaceholder: "原厂型号或苏瑞膜型号",
      inputLabel: "待对照的型号",
      allBrands: "全部品牌",
      emptyPrompt:
        "输入你现在在用的型号。我们会列出对应的苏瑞膜型号，并标明它与原规格的接近程度。",
      thSurmem: "苏瑞膜型号",
      thBrand: "原厂品牌",
      thOem: "原厂型号",
      thRelation: "关系",
      noMatchPrefix: "暂未收录",
      noMatchTail:
        "对照表正在逐条补齐。把型号发给我们，由人工对照后回复 —",
      noMatchLink: "带着该型号去询价（已预填）",
      disclaimer: FC_COMPAT_DISCLAIMER.zh,
    },

    form: {
      fullName: "姓名",
      company: "公司名称",
      workEmail: "工作邮箱",
      phone: "电话",
      accountType: "我的身份",
      select: "请选择…",
      distributor: "经销商 / 贸易商",
      endUser: "终端用户 / 项目",
      monthlyVolume: "月用量",
      monthlyVolumePh: "例如 200 支/月",
      industry: "行业",
      partNumber: "型号 / 货号",
      partNumberPh: "苏瑞膜型号，或你正在替换的原厂型号",
      quantity: "数量",
      targetMicron: "目标过滤精度",
      targetMicronPh: "例如 5 µm 绝对精度",
      leadTime: "期望交期",
      leadTimeOptions: ["请选择…", "常规", "加急", "不着急，价格优先"],
      application: "应用场景",
      applicationPh: "滤壳、进水条件、工艺…",
      message: "补充说明",
      attachment: "附件",
      attachmentHint:
        "上传功能需等询价接口（/api/v1/rfq）上线；在此之前请把图纸或照片发到 sales@aromem.com，并注明公司名称。",
      submitQuote: "提交询价",
      submitSample: "申请样品",
      sending: "提交中…",
      privacy: "你所填写的信息仅用于本次询价的回复。",
      done: "已经收到你的询价，外贸部会尽快回复价格与货期。",
      errorPrefix: "表单未能自动提交",
      errorTail: "内容不会丢失——请改用邮件发送，我们会同样按正式询价处理：",
      mailtoSubjectQuote: "滤芯询价",
      mailtoSubjectSample: "滤芯样品申请",
      industries: [
        "水处理 / 反渗透预处理",
        "电力",
        "钢铁",
        "精细化工",
        "食品饮料",
        "制药",
        "微电子",
        "其他",
      ],
    },
  },
};

export type FcDict = typeof FC_TEXT.en;

/** 取对应语言的文案字典；未接入的语言一律回退英文，避免页面空白。 */
export function fcText(locale: FcLocale = "en"): FcDict {
  return locale === "zh" ? FC_TEXT.zh : FC_TEXT.en;
}
