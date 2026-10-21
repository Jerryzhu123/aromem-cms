/**
 * darlly 三个复制品类：接口原始数据 → 页面需要的形状。
 *
 * 数据链路：后台表格 → MySQL → 前台接口 → 本模块（运行时）→ 页面
 *
 * 为什么所有导出都是异步的：50 条型号 2026-10-21 起存在 fc_product 里，
 * 渲染时经接口取，不再是编译期常量。页面侧（含 generateStaticParams /
 * generateMetadata）相应改为异步调用。
 *
 * 与 catalog-source.ts 的分工：
 *   catalog-source 服务「工业滤芯」那 25 条（ProductView 版式）；
 *   本模块服务「微孔折叠 / 大流量 / 多折」三个品类（darlly 原站版式）。
 *   两者共用同一个 /api/v1/filter-cartridges/products 接口，只是组装形状不同。
 *   缓存标签同为 catalog —— 后台改完型号或系列，两个版式一起吊销。
 *
 * 哪些东西**没有**落到库里，仍在本模块当常量：
 *   banner 图、pageSize=9、「选择类别」「所有」这两句固定文案、品类级的面包屑
 *   末级文字（取自 fc_series.name_*）。这些是原站版式的脚手架，三个品类完全
 *   一样，存进库只会变成三份重复数据，改一次要改三行。
 */

import { cache } from "react";
import { API_BASE } from "@/lib/api-base";
import { CATALOG_CACHE_TAG } from "@/lib/catalog-source";
import type { Bilingual } from "@/data/catalog";
import type {
  DarllyCategory,
  DarllyDetail,
  DarllyDetails,
  DarllyItem,
} from "@/data/darlly-types";

/** 三个已复制的品类（路由分流依据，不属于内容运营范畴） */
export const DARLLY_SERIES_SLUGS = ["pleated", "high-flow", "multifold"] as const;

/** 兜底过期：吊销请求万一没送到，最长一小时也会自动刷新 */
const FALLBACK_TTL_SECONDS = 3600;

/** 接口单次请求超时（同机通常几十毫秒，20 秒是给跨公网构建留的余量） */
const TIMEOUT_MS = 20_000;

/** 原站版式固定值（三个品类一致，不入库） */
const BANNER_LIST = "/products/darlly/banner-product.jpg";
const HEADER: Bilingual = { en: "Choose Category", zh: "选择类别" };
const ALL_LABEL: Bilingual = { en: "All", zh: "所有" };
const PAGE_SIZE = 9;

/* ------------------------------------------------------------------
   接口形状（只声明用到的字段，其余忽略）
   ------------------------------------------------------------------ */

interface ApiSubcat {
  key?: string | null;
  labelZh?: string | null;
  labelEn?: string | null;
}

interface ApiSeries {
  slug: string;
  nameZh?: string | null;
  nameEn?: string | null;
  subcats?: ApiSubcat[] | null;
}

interface ApiProduct {
  model: string;
  slug: string;
  seriesSlug: string;
  title?: string | null;
  titleZh?: string | null;
  summary?: string | null;
  summaryZh?: string | null;
  subtitle?: string | null;
  subtitleZh?: string | null;
  gallery?: string[] | null;
  sourceUrl?: string | null;
  subcats?: string[] | null;
  /** 仅详情接口返回 */
  detailHtml?: string | null;
  detailHtmlZh?: string | null;
  documents?: { docType?: string; lang?: string; fileUrl?: string }[] | null;
}

async function getJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json" },
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

const text = (s?: string | null): string => (s ?? "").trim();

/** 双语：中文缺了回退英文，避免页面半边空白 */
const bilingual = (en?: string | null, zh?: string | null): Bilingual => {
  const e = text(en);
  return { en: e, zh: text(zh) || e };
};

/* ------------------------------------------------------------------
   一次取齐三个品类的数据
   ------------------------------------------------------------------ */

interface DarllyData {
  categories: Map<string, DarllyCategory>;
  /** `${series}/${slug}` → 接口行（详情页取正文用，避免二次请求列表） */
  rows: Map<string, ApiProduct>;
}

const loadDarllyData = cache(async (): Promise<DarllyData> => {
  const allSeries = await getJson<ApiSeries[]>(`${API_BASE}/api/v1/fc-series`);
  const targets = allSeries.filter((s) =>
    (DARLLY_SERIES_SLUGS as readonly string[]).includes(s.slug),
  );

  // 三个品类各自一份型号清单，并发取；单个品类失败不影响另外两个
  const lists = await Promise.all(
    targets.map((t) =>
      getJson<ApiProduct[]>(
        `${API_BASE}/api/v1/filter-cartridges/products?series=${encodeURIComponent(t.slug)}`,
      ),
    ),
  );

  const categories = new Map<string, DarllyCategory>();
  const rows = new Map<string, ApiProduct>();

  targets.forEach((s, i) => {
    const list = (Array.isArray(lists[i]) ? lists[i] : []).filter(
      // 缺网址段或型号的行生成不了页面，跳过而不是让整页报错
      (r) => Boolean(r.slug && r.model),
    );

    const items: DarllyItem[] = list.map((r) => {
      rows.set(`${s.slug}/${r.slug}`, r);
      return {
        slug: r.slug,
        model: r.model,
        // 主图取图集第一张：后台换了主图，列表和详情同时跟着变
        img: (r.gallery ?? []).map(text).filter(Boolean)[0] ?? "",
        name: bilingual(r.title, r.titleZh),
        desc: bilingual(r.summary, r.summaryZh),
        sourceUrl: text(r.sourceUrl),
      };
    });

    // 子分类归属来自型号上的 subcats（原站是多对多），字典来自系列
    const subcats = (s.subcats ?? [])
      .filter((sc): sc is ApiSubcat & { key: string } => Boolean(sc?.key))
      .map((sc) => ({
        key: sc.key,
        label: bilingual(sc.labelEn, sc.labelZh),
        models: list
          .filter((r) => (r.subcats ?? []).includes(sc.key))
          .map((r) => r.slug),
      }))
      // 交集为空的子分类不展示（原站某个分类下确实可能一间都没有）
      .filter((sc) => sc.models.length > 0);

    categories.set(s.slug, {
      slug: s.slug,
      banner: BANNER_LIST,
      crumb: bilingual(s.nameEn, s.nameZh),
      header: HEADER,
      allLabel: ALL_LABEL,
      pageSize: PAGE_SIZE,
      subcats,
      items,
    });
  });

  if (categories.size === 0) {
    throw new Error("darlly 品类组装后为空：接口没有返回 pleated / high-flow / multifold");
  }

  return { categories, rows };
});

/* ------------------------------------------------------------------
   对外查询
   ------------------------------------------------------------------ */

/** 某个品类的页数据；不是这三个品类时返回 undefined（交给别的版式） */
export async function darllyCategory(slug: string): Promise<DarllyCategory | undefined> {
  return (await loadDarllyData()).categories.get(slug);
}

/** 品类页的型号（按系列 + 网址段） */
export async function darllyItem(
  seriesSlug: string,
  itemSlug: string,
): Promise<DarllyItem | undefined> {
  return (await darllyCategory(seriesSlug))?.items.find((i) => i.slug === itemSlug);
}

/** 全部型号的网址参数，供 generateStaticParams 展开路由 */
export async function darllyProductParams(): Promise<
  { series: string; model: string }[]
> {
  const { categories } = await loadDarllyData();
  return [...categories.values()].flatMap((c) =>
    c.items.map((it) => ({ series: c.slug, model: it.slug })),
  );
}

/**
 * 详情正文（中英两份）。
 *
 * 为什么单独请求：列表接口不返回正文——单条最长 6991 字符，560 条型号一起吐出
 * 会有几 MB，而列表页一个字都用不到。只有进详情页才按 slug 取一次。
 */
export async function darllyDetails(
  seriesSlug: string,
  itemSlug: string,
): Promise<DarllyDetails> {
  const row = await getJson<ApiProduct>(
    `${API_BASE}/api/v1/filter-cartridges/products/${encodeURIComponent(itemSlug)}` +
      `?series=${encodeURIComponent(seriesSlug)}`,
  );

  const pdfOf = (lang: "zh" | "en"): string => {
    const hit = (row.documents ?? []).find(
      (d) => d.lang === lang && (d.docType ?? "") === "datasheet",
    );
    return text(hit?.fileUrl);
  };

  const toDetail = (html?: string | null, lang: "zh" | "en" = "zh"): DarllyDetail | undefined => {
    const h = text(html);
    if (!h) return undefined;
    return { html: h, pdf: pdfOf(lang), ids: anchorIds(h) };
  };

  return {
    zh: toDetail(row.detailHtmlZh, "zh"),
    en: toDetail(row.detailHtml, "en"),
  };
}

/** 从前端正文里提取带 id 的标题，供页内锚点条使用（原站就是这几个大写 id） */
function anchorIds(html: string): string[] {
  const out = new Set<string>();
  const re = /id="([A-Za-z][A-Za-z0-9_-]*)"/g;
  let m: RegExpExecArray | null = re.exec(html);
  while (m !== null) {
    out.add(m[1]);
    m = re.exec(html);
  }
  return [...out];
}
