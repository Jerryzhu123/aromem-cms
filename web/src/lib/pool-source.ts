/**
 * 泳池滤芯数据源：构建期快照 → 页面。
 *
 * 数据不再直接来自编译期常量（src/data/pool.ts / pool-detail.ts），
 * 而是来自 scripts/fetch-products.mjs 在 build 前从后台接口拉下来的快照
 * src/data/__generated__/pool.json。改数据的入口从「改代码」变成「后台表格」。
 *
 * 为什么读 JSON 快照而不是页面里 fetch：
 *   静态导出要生成 495×2 个页面，页面内 fetch 会把同一个请求重复上百次；
 *   构建期拉一次落盘，既快又能留档，接口挂了还能沿用上次结果。
 *
 * 对外仍暴露 PoolItem / PoolDetail 两个既有类型，组件无需改动。
 */
import snapshot from "@/data/__generated__/pool.json";
import type { DarllyCategory } from "@/data/darlly";
import type { PoolItem } from "@/data/pool";
import type { PoolDetail } from "@/data/pool-detail";

interface PoolSnapshot {
  generatedAt: string;
  source: "api" | "fallback";
  count: number;
  items: PoolItem[];
  details: Record<string, PoolDetail>;
}

const SNAP = snapshot as unknown as PoolSnapshot;

/** slug（URL 段）→ 商品 */
const BY_SLUG = new Map<string, PoolItem>(SNAP.items.map((it) => [it.slug, it]));
/** sku（件号）→ 详情；泳池的 slug 与 sku 目前恒等，但映射分开以免将来 slug 变形时踩空 */
const DETAIL_BY_SKU = new Map<string, PoolDetail>(
  Object.entries(SNAP.details ?? {}),
);

/** 构建期快照的元信息，供页面在开发环境提示数据新鲜度 */
export const poolSnapshot = {
  generatedAt: SNAP.generatedAt,
  source: SNAP.source,
  count: SNAP.count,
} as const;

/** 全部 URL 段，供 generateStaticParams 使用 */
export function poolSlugs(): string[] {
  return SNAP.items.map((it) => it.slug);
}

/** 全部商品（品类页列表用） */
export function poolItems(): PoolItem[] {
  return SNAP.items;
}

/** 按 URL 段取商品 */
export function getPoolItem(slug: string): PoolItem | undefined {
  return BY_SLUG.get(slug);
}

/** 按件号取规格；商品存在但规格缺失时返回 undefined，由调用方按「无规格」处理 */
export function getPoolDetail(sku: string): PoolDetail | undefined {
  return DETAIL_BY_SKU.get(sku);
}

/* ------------------------------------------------------------------
   品类页：把快照还原成 DarllyCategory（品类页组件的入参形状）
   ------------------------------------------------------------------ */

/** 面积分档，与原站「选择类别」药丸一致；slug 固定，文案不变 */
const SQFT_BUCKETS: { key: string; label: { en: string; zh: string }; test: (n: number | null) => boolean }[] = [
  { key: "s25", label: { en: "Up to 25 sq.ft.", zh: "25 平方英尺及以下" }, test: (n) => n !== null && n <= 25 },
  { key: "s50", label: { en: "26–50 sq.ft.", zh: "26–50 平方英尺" }, test: (n) => n !== null && n > 25 && n <= 50 },
  { key: "s100", label: { en: "51–100 sq.ft.", zh: "51–100 平方英尺" }, test: (n) => n !== null && n > 50 && n <= 100 },
  { key: "s150", label: { en: "101–150 sq.ft.", zh: "101–150 平方英尺" }, test: (n) => n !== null && n > 100 && n <= 150 },
  { key: "sbig", label: { en: "Over 150 sq.ft.", zh: "150 平方英尺以上" }, test: (n) => n !== null && n > 150 },
  { key: "na", label: { en: "Area not listed", zh: "未标注面积" }, test: (n) => n === null },
];

/** 只取件号本身：`Unicel: C-9999` → `C-9999` */
function repCode(s: string): string {
  const i = s.indexOf(":");
  return (i >= 0 ? s.slice(i + 1) : s).trim();
}

/**
 * 品类页数据。分档与描述都在这里由快照现算——
 * 原先是 gen.py 一次性写死的，后台改一条面积就得重跑脚本，现在跟着数据走。
 */
export function poolCategory(): DarllyCategory {
  const items = SNAP.items.map((it) => {
    const d = DETAIL_BY_SKU.get(it.sku);
    const maker = d?.maker?.trim() || "";
    const reps = (d?.replacements ?? []).map(repCode).filter(Boolean);
    const enDesc = [maker, reps.length ? `Replaces ${reps.join(" / ")}` : ""].filter(Boolean).join(" · ");
    const zhDesc = [maker ? `原厂对应 ${maker}` : "", reps.length ? `可替代 ${reps.join(" / ")}` : ""]
      .filter(Boolean)
      .join(" · ");

    return {
      slug: it.slug,
      model: it.sku,
      img: it.img,
      name: { en: it.name, zh: it.nameZh },
      desc: { en: enDesc, zh: zhDesc },
      sourceUrl: "",
    };
  });

  const subcats = SQFT_BUCKETS.map((b) => ({
    key: b.key,
    label: b.label,
    models: SNAP.items.filter((it) => b.test(it.sqft)).map((it) => it.slug),
  })).filter((sc) => sc.models.length > 0);

  return {
    slug: "pool",
    banner: "/products/darlly/banner-product.jpg",
    crumb: { en: "Pool Filter Cartridges", zh: "泳池滤芯" },
    header: { en: "Choose Category", zh: "选择类别" },
    allLabel: { en: "All", zh: "所有" },
    pageSize: 9,
    subcats,
    items,
  };
}
