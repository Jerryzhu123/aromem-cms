import type { NavItem } from "@/types/content";

/**
 * 站点导航。
 *
 * 2026-10-10 定位调整（客户确认）：站点定位改为 Industrial Filtration & Membrane Solutions，
 * 产品分两大板块：① Filter Cartridges & Housings（滤芯与壳体并列，六个子类）
 * ② RO Membranes & Components（RO 膜与组件）。
 * 第三个展示项 Components & Accessories（通用配件）**暂不进导航**：
 * 按方案约定「有货才上线」，避免出现点进去是空的入口；有商品后再打开下面注释掉的行即可。
 */

/** Chinese navigation. */
export const zhNav: NavItem[] = [
  { label: "首页", href: "/zh" },
  {
    label: "产品中心",
    href: "/zh/products?id=22",
    children: [
      // 板块①：滤芯与壳体（壳体与滤芯并列，六个子类）
      { label: "滤芯与滤芯壳体", href: "/zh/products/filter-cartridges" },
      // 板块②：RO 膜与组件
      { label: "RO 膜与组件", href: "/zh/products/ro-membranes" },
      // 暂不上线：{ label: "通用配件", href: "/zh/products/components-accessories" },
      { label: "型号对照", href: "/zh/cross-reference" },
    ],
  },
  {
    label: "工程实例",
    href: "/zh/projects?id=1",
    children: [
      { label: "电力行业", href: "/zh/projects?id=1" },
      { label: "钢铁行业", href: "/zh/projects?id=2" },
      { label: "海水淡化", href: "/zh/projects?id=3" },
      { label: "精细化工", href: "/zh/projects?id=4" },
      { label: "渗透液处理行业", href: "/zh/projects?id=5" },
    ],
  },
  { label: "新闻资讯", href: "/zh/news_list" },
  {
    label: "下载中心",
    href: "/zh/handbook",
    children: [{ label: "产品手册", href: "/zh/handbook" }],
  },
  {
    label: "关于我们",
    href: "/zh/about1",
    children: [
      { label: "公司概况", href: "/zh/about1" },
      { label: "企业文化", href: "/zh/about2" },
      { label: "联系我们", href: "/zh/about3" },
      { label: "知识产权、资质及企业荣誉", href: "/zh/about4" },
    ],
  },
  { label: "加入我们", href: "/zh/join" },
];

/** English navigation. */
export const enNav: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Product center",
    href: "/products?id=3",
    children: [
      // Block ① — cartridges and housings presented side by side.
      { label: "Cartridges & Housings", href: "/products/filter-cartridges" },
      // Block ② — RO membranes and components.
      { label: "RO Membranes & Components", href: "/products/ro-membranes" },
      // Held back until stocked: { label: "Components & Accessories", href: "/products/components-accessories" },
      { label: "Cross-Reference", href: "/cross-reference" },
    ],
  },
  {
    label: "Engineering examples",
    href: "/projects?id=1",
    children: [
      { label: "THE POWER INDUSTRY", href: "/projects?id=1" },
      { label: "THE IRON AND STEEL INDUSTRY", href: "/projects?id=2" },
      { label: "SEA WATER DESALINATION", href: "/projects?id=3" },
      { label: "FINE CHEMICAL INDUSTRY", href: "/projects?id=4" },
      { label: "OSMOTIC TREATMENT INDUSTRY", href: "/projects?id=5" },
    ],
  },
  { label: "News", href: "/news_list" },
  {
    label: "Downloads",
    href: "/handbook",
    children: [{ label: "Product brochure", href: "/handbook" }],
  },
  {
    label: "About us",
    href: "/about1",
    children: [
      { label: "Company profile", href: "/about1" },
      { label: "enterprise culture", href: "/about2" },
      { label: "Contact us", href: "/about3" },
    ],
  },
  { label: "Join us", href: "/join" },
];

/** Footer link columns. */
export const zhFooter = {
  col1: {
    title: "苏瑞膜",
    links: [
      { label: "网站首页", href: "/zh" },
      { label: "新闻资讯", href: "/zh/news_list" },
      { label: "关于我们", href: "/zh/about1" },
      { label: "加入我们", href: "/zh/join" },
    ],
  },
  col2: {
    title: "产品中心",
    links: [
      // 定位调整后：两大板块排最前，壳体与滤芯同归板块①。
      { label: "滤芯与滤芯壳体", href: "/zh/products/filter-cartridges" },
      { label: "RO 膜与组件", href: "/zh/products/ro-membranes" },
      { label: "型号对照", href: "/zh/cross-reference" },
      { label: "获取报价", href: "/zh/request-a-quote" },
    ],
  },
  col3: {
    title: "工程实例",
    links: [
      { label: "电力行业", href: "/zh/projects?id=1" },
      { label: "钢铁行业", href: "/zh/projects?id=2" },
      { label: "海水淡化", href: "/zh/projects?id=3" },
      { label: "精细化工", href: "/zh/projects?id=4" },
      { label: "渗透液处理行业", href: "/zh/projects?id=5" },
    ],
  },
  contact: {
    title: "联系方式",
    address:
      "地址：苏州市吴中区甪直镇凌港路128号（富民一区）;\n嘉兴市秀洲区油车港镇茶园北路257号5幢",
    phone: "电话：0512-62700495",
    qr: "/uploads/images/20210908/999bed3182d7baa9f3558c949347e3a0.jpg",
    emails: ["hr@aromem.com", "sales@aromem.com"],
  },
  copyright:
    "© Copyright 2017 苏州苏瑞膜纳米科技集团有限公司    Company name:AROMEM PteLtd",
  icp: { label: "苏ICP备17025113号-1", href: "http://beian.miit.gov.cn/" },
};

export const enFooter = {
  col1: {
    title: "AROMEM",
    links: [
      { label: "HOME", href: "/" },
      { label: "NEWS", href: "/news_list" },
      { label: "ANOUT US", href: "/about1" },
      { label: "JOIN US", href: "/join" },
    ],
  },
  col2: {
    title: "PRODUCT CENTER",
    links: [
      { label: "Cartridges & Housings", href: "/products/filter-cartridges" },
      { label: "RO Membranes & Components", href: "/products/ro-membranes" },
      { label: "Cross-Reference", href: "/cross-reference" },
      { label: "Request a Quote", href: "/request-a-quote" },
    ],
  },
  col3: {
    title: "ENGINEERING EXAMPLES",
    links: [
      { label: "THE POWER INDUSTRY", href: "/projects?id=1" },
      { label: "THE IRON AND STEEL INDUSTRY", href: "/projects?id=2" },
      { label: "SEA WATER DESALINATION", href: "/projects?id=3" },
      { label: "FINE CHEMICAL INDUSTRY", href: "/projects?id=4" },
      { label: "OSMOTIC TREATMENT INDUSTRY", href: "/projects?id=5" },
    ],
  },
  contact: {
    title: "CONTACT US",
    address:
      "Address: Building 1, Fumin Area 1 Industrial Park, No.128 Linggang Road, Luzhi Town，Wuzhong District, Suzhou city, Jiangsu province, China; Building 5, No.257 Chayuan North Road,Youchegang Town, Xiuzhou District, Jiaxing city, Zhejiang province, China",
    phone: "Phone: +86-0512-62700495",
    qr: "/uploads/images/20210908/6fe76a8f07af7429230f515288b8c3c4.jpg",
    emails: ["hr@aromem.com", "sales@aromem.com"],
  },
  copyright:
    "© Copyright 2017 苏州苏瑞膜纳米科技集团有限公司 Company name:AROMEM PteLtd",
  icp: { label: "苏ICP备17025113号-1", href: "http://beian.miit.gov.cn/" },
};
