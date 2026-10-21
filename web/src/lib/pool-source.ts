/**
 * 泳池滤芯数据源：接口原始数据 → 页面需要的形状。
 *
 * 数据链路：后台表格 → MySQL → 前台接口 → 本模块（运行时）→ 页面
 *
 * 为什么所有导出都是异步的：
 *   数据改为运行时从接口取，不再是静态 import 的快照，因此取值本身要 await。
 *   页面侧（含 generateStaticParams / generateMetadata）相应改为异步调用。
 *
 * 对外仍暴露 PoolItem / PoolDetail / DarllyCategory 三个既有形状，组件层零改动。
 */

import type { DarllyCategory } from "@/data/darlly-types";
import type { PoolItem } from "@/data/pool";
import type { PoolDetail } from "@/data/pool-detail";
import { loadPoolRaw, type PoolApiCrossRef, type PoolApiProduct } from "@/lib/pool-api";

interface PoolData {
  items: PoolItem[];
  /** 件号 → 详情 */
  details: Map<string, PoolDetail>;
  /** slug（网址段）→ 商品 */
  bySlug: Map<string, PoolItem>;
}

/** 接口行 → PoolItem（字段与 src/data/pool.ts 的 PoolItem 保持一致） */
function toPoolItem(row: PoolApiProduct): PoolItem {
  const gallery = Array.isArray(row.gallery) ? row.gallery.filter(Boolean) : [];
  return {
    slug: row.slug,
    sku: row.model,
    name: row.title,
    nameZh: row.titleZh || row.title,
    sqft: typeof row.sqft === "number" ? row.sqft : null,
    img: gallery[0] || "",
    images: gallery,
  };
}

/** 接口行 + 该型号的替换件号 → PoolDetail（字段与 src/data/pool-detail.ts 一致） */
function toPoolDetail(row: PoolApiProduct, replacements: string[]): PoolDetail {
  const gallery = Array.isArray(row.gallery) ? row.gallery.filter(Boolean) : [];
  return {
    sku: row.model,
    od: row.outsideDiameter || "",
    length: row.overallLength || "",
    top: row.endCapTop || "",
    bottom: row.endCapBottom || "",
    maker: row.oemMachine || "",
    replacements,
    images: gallery,
  };
}

/** 把接口两份数据合成一张索引表，同时做完整性自检 */
async function loadPoolData(): Promise<PoolData> {
  const { products, crossRefs } = await loadPoolRaw();

  // 替换件号按 SURMEM 型号分组，拼回 "Unicel: C-9999" 形态（与原站文案一致）
  const byModel = new Map<string, string[]>();
  for (const row of crossRefs as PoolApiCrossRef[]) {
    const key = row.surmemModel;
    if (!key) continue;
    const brand = (row.brand ?? "").trim();
    const oem = (row.oemModel ?? "").trim();
    if (!oem) continue;
    const label = brand ? `${brand}: ${oem}` : oem;
    const list = byModel.get(key);
    if (list) list.push(label);
    else byModel.set(key, [label]);
  }

  const items: PoolItem[] = [];
  const details = new Map<string, PoolDetail>();
  const bySlug = new Map<string, PoolItem>();

  for (const row of products) {
    // 缺网址段或件号的行无法生成页面，跳过而不是让整页报错
    if (!row.slug || !row.model) continue;
    const item = toPoolItem(row);
    items.push(item);
    bySlug.set(item.slug, item);
    details.set(item.sku, toPoolDetail(row, byModel.get(item.sku) ?? []));
  }

  if (items.length === 0) {
    throw new Error("泳池数据组装后为空，接口返回的行全部缺少 slug 或 model");
  }

  return { items, details, bySlug };
}

/* ------------------------------------------------------------------
   对外查询接口
   ------------------------------------------------------------------ */

/** 全部网址段，供 generateStaticParams 使用 */
export async function poolSlugs(): Promise<string[]> {
  const data = await loadPoolData();
  return data.items.map((it) => it.slug);
}

/** 全部商品（品类页列表用） */
export async function poolItems(): Promise<PoolItem[]> {
  const data = await loadPoolData();
  return data.items;
}

/** 按网址段取商品 */
export async function getPoolItem(slug: string): Promise<PoolItem | undefined> {
  const data = await loadPoolData();
  return data.bySlug.get(slug);
}

/** 按件号取规格；商品存在但规格缺失时返回 undefined，由调用方按「无规格」处理 */
export async function getPoolDetail(sku: string): Promise<PoolDetail | undefined> {
  const data = await loadPoolData();
  return data.details.get(sku);
}

/* ------------------------------------------------------------------
   品类页：把数据还原成 DarllyCategory（品类页组件的入参形状）
   ------------------------------------------------------------------ */

/** 面积分档，与原站「选择类别」药丸一致；key 固定，文案不变 */
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
 * 品类页数据。分档与描述都由数据现算——
 * 后台改一条面积，页面跟着变，不再需要跑任何脚本。
 */
export async function poolCategory(): Promise<DarllyCategory> {
  const data = await loadPoolData();

  const items = data.items.map((it) => {
    const d = data.details.get(it.sku);
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
    models: data.items.filter((it) => b.test(it.sqft)).map((it) => it.slug),
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
