/**
 * 泳池滤芯原始数据获取（运行时）。
 *
 * 与旧做法的根本区别：
 *   旧版在 build 前跑脚本把接口数据落成 JSON 快照，页面静态 import 快照——
 *   数据被烘焙进产物，后台改完必须重新构建才生效（实测改标题、下架均不反映）。
 *   本版在页面渲染时直接取接口，并给请求登记缓存标签 "pool"；后台保存成功后
 *   调用 /api/revalidate 吊销标签，下次访问即重新渲染，无需重新部署。
 *
 * 缓存策略：
 *   - 打标签 pool，供 revalidateTag("pool") 定向吊销；
 *   - 另设 3600 秒兜底过期，即使吊销请求丢失（进程重启、网络抖动），
 *     一小时内也会自动刷新，不会长期停留在旧数据；
 *   - 外面套 React 的 cache()，同一次渲染里多次调用只取一次，不重复请求。
 *
 * 接口地址：
 *   构建期与运行期不同。服务器上页面进程与后端同机，走 127.0.0.1:8080
 *   可省掉一圈公网往返；构建机没有内网路径，必须走公网域名。
 *   因此用环境变量 POOL_API_BASE 区分，缺省走公网。
 *
 * 失败处理：
 *   不静默兜底。接口不可用时抛出，让构建失败或让页面明确报错——
 *   悄悄用旧数据上线，比构建失败危险得多。
 */

import { cache } from "react";

/** 缓存标签：后台改动后吊销这一组，只影响泳池商品页，不动其余页面 */
export const POOL_CACHE_TAG = "pool";

const API_BASE = (process.env.POOL_API_BASE || "https://www.surmem.com").replace(/\/$/, "");

/** 兜底过期秒数：吊销请求万一没送到，最长一小时后自动恢复新鲜 */
const FALLBACK_TTL_SECONDS = 3600;

/** 接口单次请求超时：接口与页面同机时通常几十毫秒，20 秒是给跨公网构建留的余量 */
const TIMEOUT_MS = 20_000;

/** 商品行（字段名与后端 JSON 契约一致） */
export interface PoolApiProduct {
  slug: string;
  model: string;
  title: string;
  titleZh?: string | null;
  sqft?: number | null;
  gallery?: string[] | null;
  outsideDiameter?: string | null;
  overallLength?: string | null;
  endCapTop?: string | null;
  endCapBottom?: string | null;
  oemMachine?: string | null;
}

/** 替换件号行 */
export interface PoolApiCrossRef {
  surmemModel?: string | null;
  oemModel?: string | null;
  brand?: string | null;
}

async function getJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json" },
      // 登记标签 + 兜底过期，两者缺一不可：
      // 只打标签没有兜底，吊销一旦丢失就会永久停在旧数据。
      next: { tags: [POOL_CACHE_TAG], revalidate: FALLBACK_TTL_SECONDS },
    });
    if (!res.ok) throw new Error(`接口 ${url} 返回 HTTP ${res.status}`);
    const body: unknown = await res.json();
    // 后端统一契约 {code,msg,data}
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

export interface PoolRawData {
  products: PoolApiProduct[];
  crossRefs: PoolApiCrossRef[];
  /** 取数时间，用于页面与日志排查数据新鲜度 */
  fetchedAt: string;
  /** 实际使用的接口基地址，便于确认构建期与运行期是否走对了路径 */
  apiBase: string;
}

/**
 * 取全量泳池数据。商品清单与替换件号并发请求，任一失败即整体失败。
 *
 * 用 cache 包裹：构建期生成 990 个页面时会多次调用，同一渲染上下文内命中缓存，
 * 跨页面则由 fetch 自身的缓存承接，整个构建过程只真正请求接口一次。
 */
export const loadPoolRaw = cache(async (): Promise<PoolRawData> => {
  const [products, crossRefs] = await Promise.all([
    getJson<PoolApiProduct[]>(`${API_BASE}/api/v1/filter-cartridges/products?series=pool`),
    getJson<PoolApiCrossRef[]>(`${API_BASE}/api/v1/cross-reference?series=pool`),
  ]);

  if (!Array.isArray(products) || products.length === 0) {
    throw new Error("泳池商品接口返回空清单，拒绝以空数据渲染（检查后台是否有 PUBLISHED 商品）");
  }

  return {
    products,
    crossRefs: Array.isArray(crossRefs) ? crossRefs : [],
    fetchedAt: new Date().toISOString(),
    apiBase: API_BASE,
  };
});
