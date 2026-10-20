/**
 * 全站中文文案（与 site.ts 结构一一对应，供 /zh 路由段使用）。
 *
 * 术语口径：filter cartridge=滤芯，RO membrane=反渗透膜，
 * private label=贴牌，lead time=交期，micron rating=过滤精度。
 */

/** 一级导航（href 带 /zh 前缀，与旧站「英文根路径、中文 /zh」结构一致） */
export const NAV = [
  { label: "首页", href: "/zh" },
  { label: "关于我们", href: "/zh/about" },
  { label: "产品中心", href: "/zh/products" },
  { label: "OEM 与贴牌", href: "/zh/oem" },
  { label: "应用行业", href: "/zh/applications" },
  { label: "联系我们", href: "/zh/contact" },
] as const;

/** 首页英雄区 */
export const HOME_HERO = {
  eyebrow: "工业过滤 · 全球 B2B 供应",
  title: "为您的业务而生的过滤产品",
  text: "面向经销商、进口商与贴牌合作伙伴的工业滤芯与反渗透膜产品。了解产品选项，与我们洽谈您的采购需求。",
  primaryCta: { label: "了解产品", href: "/zh/products" },
  secondaryCta: { label: "获取报价", href: "/zh/contact" },
};

/** 首页产品组合三卡片 */
export const HOME_PORTFOLIO = {
  kicker: "产品组合",
  title: "两条聚焦的产品线",
  intro: "为多样化的业务需求提供工业过滤产品与膜解决方案。",
  cards: [
    {
      title: "工业滤芯",
      text: "折叠、大流量及其他工业滤芯选项，以规格确认为准。",
      href: "/zh/products",
      cta: "查看产品",
      art: "",
    },
    {
      title: "反渗透膜",
      text: "用于水处理应用的反渗透膜产品。",
      href: "/zh/products",
      cta: "查看产品",
      art: "ro",
    },
    {
      title: "OEM 与贴牌",
      text: "洽谈适合您分销品牌的贴标、包装与规格方案。",
      href: "/zh/oem",
      cta: "了解服务",
      art: "custom",
    },
  ],
};

/** 首页合作伙伴分栏 */
export const HOME_PARTNER = {
  kicker: "为 B2B 合作伙伴而生",
  title: "经销商的务实供应伙伴",
  intro:
    "我们专注于帮助进口商、批发商与过滤经销商以清晰的规格、及时的沟通和可靠的交期采购合适的产品。",
  points: [
    "清晰的产品规格与诚实的交期",
    "跨时区的及时沟通响应",
    "灵活的 OEM 与贴牌洽谈",
    "着眼长期供货合作，而非一次性交易",
  ],
};

/** 首页四条支撑能力 */
export const HOME_SUPPORT = {
  kicker: "我们如何支持您的业务",
  title: "从规格确认到出货，可靠供应。",
  items: [
    {
      num: "01",
      title: "制造支持",
      text: "接入成熟的过滤产品制造伙伴网络。",
    },
    {
      num: "02",
      title: "质量管控",
      text: "供应商协调与产品质量要求复核。",
    },
    {
      num: "03",
      title: "技术支持",
      text: "协助比对过滤规格并选择产品方案。",
    },
    {
      num: "04",
      title: "全球供应",
      text: "出口包装、单证与运输协调。",
    },
  ],
};

/** 首页行业条带 */
export const HOME_INDUSTRIES = {
  kicker: "应用行业",
  title: "覆盖各类工业过程的过滤需求",
  items: [
    "工业水处理",
    "化工过程",
    "涂料与涂层",
    "食品饮料",
    "通用过程过滤",
  ],
  cta: { label: "查看应用行业", href: "/zh/applications" },
};

/** 关于我们 */
export const ABOUT = {
  eyebrow: "关于 SURMEM",
  title: "专注于过滤供应",
  intro: "为海外企业提供工业滤芯与反渗透膜采购支持。",
  heading: "您的 B2B 过滤产品伙伴",
  lead: "SURMEM 成立于 2014 年，为工业过滤与水处理采购方提供产品采购、技术协调与国际供应服务。",
  location:
    "公司位于中国苏州，与成熟的制造伙伴合作，服务经销商、进口商、OEM 买家与工业客户。产品组合涵盖大流量滤芯、折叠滤芯、深层过滤产品，以及 4 英寸与 8 英寸反渗透膜元件。",
  panelTitle: "客户关心的事",
  panelPoints: [
    "清晰的产品规格",
    "可靠的沟通",
    "OEM 与包装洽谈",
    "长期供货合作",
  ],
  sourcingTitle: "围绕您的采购需求搭建",
  sourcingBody:
    "我们专注于及时沟通、清晰的产品选型、规格复核，以及与制造伙伴的务实协调。贴牌项目可洽谈品牌、包装与产品定制，具体取决于技术可行性与供应商配合。",
  strengthsTitle: "为什么选择 SURMEM？",
  strengths: [
    {
      title: "制造支持",
      text: "与成熟的制造伙伴协作，完成工业过滤产品的生产配套。",
    },
    {
      title: "质量管控",
      text: "与供应商共同复核产品要求及适用的质量文件。",
    },
    {
      title: "技术支持",
      text: "协助型号选择、规格确认与应用问题解答。",
    },
    {
      title: "全球供应",
      text: "面向出口的沟通、包装方案讨论与运输协调。",
    },
  ],
  disclaimer:
    "除另有说明外，支持材料中提及的生产设施、实验室资源与产品证书归属于对应的制造伙伴。",
  cta: { label: "沟通您的需求", href: "/zh/contact" },
};

/** 产品中心 */
export const PRODUCTS = {
  eyebrow: "产品中心",
  title: "工业滤芯与反渗透膜",
  intro:
    "浏览我们的产品系列及各系列下的型号参考。所有规格在报价前均需供应商确认。",
  lines: [
    {
      kicker: "主营产品线",
      title: "工业滤芯",
      cards: [
        {
          title: "微孔折叠滤芯",
          text: "依规格为工业过程提供过滤方案。",
          cta: "索取规格",
          href: "/zh/products/pleated",
        },
        {
          title: "大流量滤芯",
          text: "大通量过滤方案；请确认尺寸、过滤精度与接口方式。",
          cta: "索取详情",
          href: "/zh/products/high-flow",
        },
        {
          title: "多折滤芯",
          text: "高褶密度、大过滤面积的折叠结构，同等流量下延长使用周期。",
          cta: "索取详情",
          href: "/zh/products/multifold",
        },
        {
          title: "泳池滤芯",
          text: "用于泳池与按摩浴缸循环系统的替换滤芯；请确认尺寸与端部形式。",
          cta: "索取详情",
          href: "/zh/products/pool",
        },
      ],
    },
    {
      kicker: "第二产品线",
      title: "反渗透膜",
      cards: [
        {
          title: "反渗透膜",
          text: "基于应用场景与确认的技术规格进行膜选型。",
          cta: "索取产品资料",
          href: "/zh/products/ro-membranes",
        },
      ],
    },
  ],
};

/** OEM 及品牌定制 */
export const OEM = {
  eyebrow: "OEM 与贴牌",
  title: "您的品牌，您的产品线",
  intro: "洽谈工业过滤产品的品牌、贴标与包装方案。",
  heading: "面向经销商的贴牌选项",
  body: "欢迎垂询客户品牌过滤产品与包装定制。可实现的定制取决于产品型号、起订量与确认的供应能力。",
  points: [
    "贴牌产品品牌",
    "定制标签与外包装",
    "产品规格洽谈",
    "批量采购与供应规划",
  ],
  cards: [
    {
      title: "品牌与标签",
      text: "洽谈贴牌标识设计与产品识别方案。",
    },
    {
      title: "包装",
      text: "可洽谈纸箱、独立包装与散装包装要求。",
    },
    {
      title: "产品配置",
      text: "复核过滤介质、尺寸、过滤精度与接口方式。",
    },
  ],
  disclaimer:
    "定制内容、起订量、模具、交期与认证均随报价确认，承诺前必须核实。",
  cta: "洽谈您的项目",
};

/** 应用行业 */
export const APPLICATIONS = {
  eyebrow: "应用行业",
  title: "工业过滤应用",
  intro: "产品适用性取决于介质、工艺条件与技术要求。",
  heading: "我们可以洽谈的行业",
  cards: [
    {
      title: "液压系统",
      text: "液压油路中的过滤需求。",
    },
    {
      title: "化工过程",
      text: "工艺流体过滤应用。",
    },
    {
      title: "涂料与油漆",
      text: "涂料生产工艺中的过滤。",
    },
    {
      title: "食品与饮料",
      text: "按应用定制过滤，需合规评审。",
    },
    {
      title: "工业水处理",
      text: "滤芯预处理与反渗透膜方案。",
    },
    {
      title: "电力与公用工程",
      text: "发电与公用工程水系统的过滤需求。",
    },
    {
      title: "通用过程过滤",
      text: "通用工业工艺流体的滤芯过滤。",
    },
  ],
  notice:
    "行业示例不代表每个产品均已认证或适用于所有用途，请自行核实技术与法规要求。",
};

/** 联系我们（正式联系方式上线前由客户核实回填） */
export const CONTACT = {
  eyebrow: "联系我们",
  title: "谈谈您的过滤需求",
  intro: "发送您的产品需求，我们可以洽谈规格与报价细节。",
  heading: "获取报价",
  help: "为便于给出有效报价，请注明产品类型、尺寸、过滤精度、数量、目的地及贴牌需求。",
  productOptions: ["工业滤芯", "反渗透膜", "OEM 与贴牌"],
};

/** 页脚 */
export const FOOTER = {
  tagline: "工业过滤产品 · OEM 与贴牌解决方案",
  copyright: `© ${new Date().getFullYear()} SURMEM 版权所有`,
};
