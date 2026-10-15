/**
 * 滤芯产品线的内容接口层。
 *
 * 与首页完全一致的策略：**API 优先 + 本地静态兜底**。
 *  - 服务端组件调用 getFc* 系列函数：后端不可达时直接回退到 src/data/filterCartridges.ts；
 *  - 一旦后端补齐 /api/v1/filter-cartridges/** 接口，前端零改动即可切换到 CMS 数据。
 *
 * 本文件只包含服务端数据获取 + 一个浏览器端表单提交函数（submitRfq）。
 */
import type { FcCrossReferenceRow, FcProduct, FcSeries } from "@/data/filterCartridges";
import {
  FC_SERIES,
  getProduct,
  getSeriesProducts,
  searchCrossReference,
} from "@/data/filterCartridges";
import { request } from "./client";

/**
 * CMS 滤芯系列接口的返回形状（/api/v1/fc-series，双语全量字段）。
 */
interface CmsFcSeriesRow {
  id: number;
  slug: string;
  nameZh: string;
  nameEn: string;
  taglineZh: string | null;
  taglineEn: string | null;
  facetsZh: string[];
  facetsEn: string[];
  comingSoon: boolean;
}

/**
 * 系列清单：**库优先 + 静态补位**。
 *
 *  - 后台 /api/v1/fc-series 返回的系列按 slug 覆盖静态数据的可管理字段
 *    （中英名称 / 中英标语 / 中英筛选切面 / 上下架状态）；
 *  - 库里没有的系列（如占位系列）原样保留静态兜底，不会凭空消失；
 *  - 排列顺序沿用静态定义（数据库 sort_order 只决定接口返回次序，不重排页面）；
 *  - 后端不可达时整体回退静态，页面照常渲染。
 */
export async function getFcSeries(): Promise<FcSeries[]> {
  let rows: CmsFcSeriesRow[] | null = null;
  try {
    const data = await request<CmsFcSeriesRow[]>("/api/v1/fc-series");
    if (data && data.length) rows = data;
  } catch {
    // 后端不可达：整体走静态兜底
  }
  if (!rows) return FC_SERIES;

  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  return FC_SERIES.map((series) => {
    const row = bySlug.get(series.slug);
    if (!row) return series; // 静态补位
    return {
      ...series,
      name: row.nameEn || series.name,
      nameZh: row.nameZh || series.nameZh,
      tagline: row.taglineEn ?? series.tagline,
      taglineZh: row.taglineZh ?? series.taglineZh,
      filterFacets: row.facetsEn.length ? row.facetsEn : series.filterFacets,
      filterFacetsZh: row.facetsZh.length ? row.facetsZh : series.filterFacetsZh,
      comingSoon: row.comingSoon,
    };
  });
}

/** 某系列下的产品列表。 */
export async function getFcSeriesProducts(seriesSlug: string): Promise<FcProduct[]> {
  try {
    const data = await request<FcProduct[]>("/api/v1/filter-cartridges/products", {
      series: seriesSlug,
    });
    if (data && data.length) return data;
  } catch {
    // 走本地兜底
  }
  return getSeriesProducts(seriesSlug);
}

/** 单个产品详情。 */
export async function getFcProduct(
  seriesSlug: string,
  modelSlug: string,
): Promise<FcProduct | undefined> {
  try {
    const data = await request<FcProduct>(
      `/api/v1/filter-cartridges/products/${encodeURIComponent(modelSlug)}`,
      { series: seriesSlug },
    );
    if (data) return data;
  } catch {
    // 走本地兜底
  }
  return getProduct(seriesSlug, modelSlug);
}

/** Cross-Reference 检索（服务端渲染首屏用；交互检索在客户端用本地索引）。 */
export async function getFcCrossReference(
  query: string,
  brand?: string,
): Promise<FcCrossReferenceRow[]> {
  try {
    const data = await request<FcCrossReferenceRow[]>("/api/v1/cross-reference", {
      q: query,
      brand,
    });
    if (data) return data;
  } catch {
    // 走本地兜底
  }
  return searchCrossReference(query, brand);
}

/** 询价 / 样品申请表单的字段（与方案第 7 章一致）。 */
export interface RfqPayload {
  requestType: "quote" | "sample";
  fullName: string;
  company: string;
  workEmail: string;
  phone: string;
  accountType: "Distributor" | "End user" | "";
  monthlyVolume: string;
  industry: string;
  country: string;
  partNumber: string;
  quantity: string;
  application: string;
  targetMicron: string;
  requiredLeadTime: string;
  message: string;
  /** 来源页与预填上下文，便于客服判断询价来自哪个型号。 */
  sourcePath: string;
  sourceSeries: string;
  sourceModel: string;
}

/** 提交结果：ok=false 时页面展示邮件兜底入口。 */
export interface RfqResult {
  ok: boolean;
  message: string;
}

/**
 * 提交询价 / 样品申请。
 *
 * 注意：这是**浏览器端**调用，因此用相对路径（next.config.ts 已把 /api/v1/** 代理到后端 8080）。
 * 后端 /api/v1/rfq 尚未实现时，这里会返回 ok=false，页面展示邮件兜底，不丢客户。
 */
export async function submitRfq(payload: RfqPayload): Promise<RfqResult> {
  try {
    const res = await fetch("/api/v1/rfq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // 短超时：表单提交不能把页面卡死
      signal: AbortSignal.timeout(8000),
    });
    const body = (await res.json().catch(() => null)) as
      | { code?: number; msg?: string }
      | null;
    if (res.ok && body?.code === 200) {
      return { ok: true, message: body.msg || "Your request has been received." };
    }
    return {
      ok: false,
      message: body?.msg || `Request endpoint unavailable (HTTP ${res.status}).`,
    };
  } catch {
    return { ok: false, message: "Request endpoint unreachable." };
  }
}
