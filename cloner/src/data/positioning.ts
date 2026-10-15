/**
 * 首页第一屏（定位条）文案。
 *
 * 2026-10-10 定位调整（客户确认）：
 *   - 站点定位：Industrial Filtration & Membrane Solutions；
 *   - 第一屏核心信息：SURMEM / Industrial Filtration & Membrane Solutions /
 *     Filter Cartridges · RO Membranes · Filtration Components（三个产品分区）。
 *
 * 为什么不在 home.ts 里改：首页轮播是纯图片（原站抓取），没有文字层；
 * 这里单独做一块文字优先的定位条放在轮播之上，不动轮播数据，
 * 中英文共用同一结构，避免维护两份。
 */
export interface PositioningLine {
  label: string;
  /** null = 还没上线（不渲染成链接，避免死链） */
  href: string | null;
  note?: string;
}

export interface PositioningContent {
  brand: string;
  headline: string;
  sub: string;
  lines: PositioningLine[];
  ctas: { label: string; href: string; primary?: boolean }[];
}

export function positioning(lang: "zh" | "en"): PositioningContent {
  if (lang === "zh") {
    return {
      brand: "SURMEM",
      headline: "工业过滤与膜解决方案",
      sub:
        "从滤芯、滤芯壳体到反渗透膜元件与膜壳组件：一条线上配齐，参数逐项可查，原厂型号可对照。",
      lines: [
        { label: "滤芯与壳体", href: "/zh/products/filter-cartridges" },
        { label: "RO 膜与组件", href: "/zh/products/ro-membranes" },
        { label: "通用配件", href: null, note: "即将上线" },
      ],
      ctas: [
        { label: "获取报价", href: "/zh/request-a-quote", primary: true },
        { label: "型号对照", href: "/zh/cross-reference" },
      ],
    };
  }
  return {
    brand: "SURMEM",
    headline: "Industrial Filtration & Membrane Solutions",
    sub:
      "From filter cartridges and housings to RO elements and components — specified in one place, with per-model data and cross-reference.",
    lines: [
      { label: "Cartridges & Housings", href: "/products/filter-cartridges" },
      { label: "RO Membranes & Components", href: "/products/ro-membranes" },
      { label: "Components & Accessories", href: null, note: "Coming soon" },
    ],
    ctas: [
      { label: "Request a Quote", href: "/request-a-quote", primary: true },
      { label: "Cross-Reference", href: "/cross-reference" },
    ],
  };
}
