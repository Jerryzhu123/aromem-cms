/**
 * 工业滤芯数据源：库里的扁平行 + 系列模板文案 → 页面要的 CatalogProduct。
 *
 * 为什么要有这一层（与 2026-10-21 之前做法的区别）：
 *   旧版 `src/data/catalog.ts` 把 25 条型号和 7 个系列写成编译期常量，
 *   页面静态 import。后果是后台改了不生效、新增型号没有页面——
 *   跟泳池在「纯静态导出」时期踩的是同一个坑。
 *   本模块在渲染时从后台接口取数，并登记缓存标签 "catalog"；
 *   后台保存后由 PoolCacheNotifier 通知吊销，下次访问即重新渲染。
 *
 * 数据落位（V11 迁移定下的规矩）：
 *   - 型号独有文案（分类 / 规格 / 简介 / 应用说明 / 复核说明）在 fc_product；
 *   - 系列共用文案（报价清单 / 核实声明）在 fc_series，本模块在组装时
 *     把它们挂回每个型号——页面组件看到的仍然是完整的一件 CatalogProduct，
 *     不需要知道这两组东西其实存在两张表里。
 *
 * 失败处理：
 *   不静默兜底。接口不可用就抛出，让构建失败或页面明确报错——
 *   悄悄拿旧常量顶上，会让「后台改完了吗」这件事永远说不清。
 *
 * 泳池滤芯不在这里：它有自己的 lib/pool-source.ts（数据量大、结构不同）。
 */

import { cache } from "react";
import type { Bilingual, CatalogProduct, CatalogSeries } from "@/data/catalog";
import { API_BASE } from "@/lib/api-base";

/** 缓存标签：后台改 fc-product / fc-series 后吊销这一组 */
export const CATALOG_CACHE_TAG = "catalog";

/** 兜底过期：吊销请求万一没送到，最长一小时也会自动刷新 */
const FALLBACK_TTL_SECONDS = 3600;

/** 接口单次请求超时（同机通常几十毫秒，20 秒是给跨公网构建留的余量） */
const TIMEOUT_MS = 20_000;

/** 泳池走自己的数据源，这里一律排除 */
const POOL_SLUG = "pool";

/** 系列行（字段名与后端 SeriesItem 一致） */
interface CatalogApiSeries {
  slug: string;
  nameZh?: string | null;
  nameEn?: string | null;
  taglineZh?: string | null;
  taglineEn?: string | null;
  /** V9 迁移的列：系列图标（媒体库 relativeUrl），2026-10-21 起接口才吐出来 */
  iconUrl?: string | null;
  comingSoon?: boolean;
  checklistZh?: string[] | null;
  checklistEn?: string[] | null;
  verificationZh?: string | null;
  verificationEn?: string | null;
}

/** 型号行（只声明本模块用到的字段，其余接口字段忽略） */
interface CatalogApiProduct {
  model: string;
  slug: string;
  seriesSlug: string;
  title?: string | null;
  titleZh?: string | null;
  gallery?: string[] | null;
  category?: string | null;
  categoryZh?: string | null;
  spec?: string | null;
  specZh?: string | null;
  summary?: string | null;
  summaryZh?: string | null;
  applicationNote?: string | null;
  applicationNoteZh?: string | null;
  technicalNote?: string | null;
  technicalNoteZh?: string | null;
  sourceUrl?: string | null;
}

async function getJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json" },
      // 打标签供定向吊销；同时留兜底过期，吊销丢失也不会长期停在旧数据
      next: { tags: [CATALOG_CACHE_TAG], revalidate: FALLBACK_TTL_SECONDS },
    });
    if (!res.ok) throw new Error(`接口 ${url} 返回 HTTP ${res.status}`);
    const body: unknown = await res.json();
    if (body && typeof body === "object" && "code" in body) {
      const envelope = body as { code: number; msg?: string; data?: T };
      if (envelope.code !== 200) {
        throw new Error(`接口 ${url} 业务码 ${envelope.code}：${envelope.msg ?? "无消息"}`);
      }
      return envelope.data as T;
    }
    return body as T;
  } finally {
    clearTimeout(timer);
  }
}

/** 系列清单里没有 kind 字段：RO 板块只有 ro-membranes 一个系列，按 slug 判定 */
const kindOf = (slug: string): "filter" | "ro" =>
  slug === "ro-membranes" ? "ro" : "filter";

const text = (s?: string | null): string => (s ?? "").trim();

/** 双语字段：中文缺了就回退英文，避免页面出现半边空白 */
const bilingual = (en?: string | null, zh?: string | null): Bilingual => {
  const e = text(en);
  return { en: e, zh: text(zh) || e };
};

interface CatalogData {
  series: CatalogSeries[];
  products: CatalogProduct[];
  bySlug: Map<string, CatalogProduct>;
  /** 系列行原样保留，组装型号时要取系列级模板文案 */
  seriesRows: Map<string, CatalogApiSeries>;
}

/**
 * 全量取数：先拿系列清单，再并发拿各系列型号。
 *
 * 为什么按系列并发而不是一次拉全部：
 *   /products 不带 series 会把泳池 495 条一起吐出来（几百 KB），
 *   而这里只要工业滤芯那 70 多条。按系列取每个响应都很小。
 *
 * 用 cache 包裹：构建期生成上百个页面会反复调用，同一渲染上下文内只取一次；
 * 跨页面则由 fetch 自身的缓存承接。
 */
/**
 * 系列清单原样取一次（含 pool）。
 *
 * 为什么单独拆出来：产品中心页要展示「全部产品线」的格子，池也是其中一格；
 * 但池的 495 条型号不能跟着拉——catalog-source 的型号清单必须排除池。
 * 所以系列行与型号分开：本函数只拿系列行，loadCatalogData 在此基础上再排除池。
 *
 * 同一个 URL 的 fetch 在 Next 里会被请求级去重，两处调用不会真的发两次。
 */
const loadSeriesRows = cache(async (): Promise<CatalogApiSeries[]> => {
  const raw = await getJson<CatalogApiSeries[]>(`${API_BASE}/api/v1/fc-series`);
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error(
      "系列接口返回空清单，拒绝以空数据渲染（检查后台「滤芯系列」是否有 PUBLISHED 记录）",
    );
  }
  return raw.filter((s) => Boolean(s.slug));
});

export const loadCatalogData = cache(async (): Promise<CatalogData> => {
  const rawSeries = await loadSeriesRows();
  const rows = rawSeries.filter((s) => s.slug !== POOL_SLUG);
  if (rows.length === 0) {
    throw new Error(
      "排除泳池后没有可用系列（检查后台「滤芯系列」的发布状态）",
    );
  }

  const seriesRows = new Map(rows.map((r) => [r.slug, r]));
  const series: CatalogSeries[] = rows.map((r) => ({
    slug: r.slug,
    kind: kindOf(r.slug),
    name: bilingual(r.nameEn, r.nameZh),
    tagline: bilingual(r.taglineEn, r.taglineZh),
    iconUrl: text(r.iconUrl),
  }));

  const lists = await Promise.all(
    rows.map((r) =>
      getJson<CatalogApiProduct[]>(
        `${API_BASE}/api/v1/filter-cartridges/products?series=${encodeURIComponent(r.slug)}`,
      ),
    ),
  );

  const products: CatalogProduct[] = [];
  for (const list of lists) {
    for (const row of Array.isArray(list) ? list : []) {
      // 缺网址段或型号的行生成不了页面，跳过而不是让整页报错
      if (!row.slug || !row.model) continue;
      const tpl = seriesRows.get(row.seriesSlug);
      if (!tpl) continue;
      products.push({
        model: row.model,
        slug: row.slug,
        seriesSlug: row.seriesSlug,
        kind: kindOf(row.seriesSlug),
        name: bilingual(row.title, row.titleZh),
        category: bilingual(row.category, row.categoryZh),
        spec: bilingual(row.spec, row.specZh),
        summary: bilingual(row.summary, row.summaryZh),
        // 系列级模板：整个系列共用一份，所以从系列行取，不从商品行取
        checklist: {
          en: tpl.checklistEn ?? [],
          zh: tpl.checklistZh ?? [],
        },
        application: bilingual(row.applicationNote, row.applicationNoteZh),
        technicalNote: bilingual(row.technicalNote, row.technicalNoteZh),
        verification: bilingual(tpl.verificationEn, tpl.verificationZh),
        sourceUrl: text(row.sourceUrl),
        photo: (row.gallery ?? []).map(text).filter(Boolean)[0],
      });
    }
  }

  if (products.length === 0) {
    throw new Error("工业滤芯组装后为空，接口返回的行全部缺少 slug 或 model");
  }

  return {
    series,
    products,
    bySlug: new Map(products.map((p) => [`${p.seriesSlug}/${p.slug}`, p])),
    seriesRows,
  };
});

/* ------------------------------------------------------------------
   对外查询（全部异步——数据不再是静态 import 的快照）
   ------------------------------------------------------------------ */

/** 全部系列（不含泳池），顺序即后台的 sort_order */
export async function catalogSeries(): Promise<CatalogSeries[]> {
  return (await loadCatalogData()).series;
}

/**
 * 全部系列（**含泳池**），顺序即后台 sort_order。
 *
 * 给产品中心页的格子用：那里要按产品线列出所有品类，池也是滤芯线的一格。
 * 只返回系列行，不带型号，所以不会把泳池 495 条一起拉下来。
 */
export async function allSeries(): Promise<CatalogSeries[]> {
  return (await loadSeriesRows()).map((r) => ({
    slug: r.slug,
    kind: kindOf(r.slug),
    name: bilingual(r.nameEn, r.nameZh),
    tagline: bilingual(r.taglineEn, r.taglineZh),
    iconUrl: text(r.iconUrl),
  }));
}

/** 系列页路由清单 */
export async function catalogSeriesSlugs(): Promise<string[]> {
  return (await loadCatalogData()).series.map((s) => s.slug);
}

/** 型号页路由清单（系列 + 型号两段） */
export async function catalogProductParams(): Promise<
  { series: string; model: string }[]
> {
  return (await loadCatalogData()).products.map((p) => ({
    series: p.seriesSlug,
    model: p.slug,
  }));
}

/** 按网址段取系列 */
export async function getSeries(slug: string): Promise<CatalogSeries | undefined> {
  return (await loadCatalogData()).series.find((s) => s.slug === slug);
}

/** 某系列下的全部型号 */
export async function getProductsBySeries(seriesSlug: string): Promise<CatalogProduct[]> {
  return (await loadCatalogData()).products.filter((p) => p.seriesSlug === seriesSlug);
}

/** 按系列 + 型号取商品 */
export async function getProduct(
  seriesSlug: string,
  modelSlug: string,
): Promise<CatalogProduct | undefined> {
  return (await loadCatalogData()).bySlug.get(`${seriesSlug}/${modelSlug}`);
}
