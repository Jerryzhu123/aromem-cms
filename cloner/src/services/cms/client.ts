/**
 * CMS 内容接口 axios 二次封装（与 docs/frontend/api-template 同源契约）。
 *
 * - 统一响应体 {code, msg, data}：HTTP 状态码与 code 同义（200/400/404/500）
 * - code === 200 直接返回 data；404 返回 null（内容缺失是正常分支，页面走兜底）
 * - 本模块只在服务端组件中使用（Next.js RSC），直连后端 8080，无跨域问题
 * - 短超时：后端不可达时快速失败，页面回退本地静态数据，绝不阻塞渲染
 */
import axios, { AxiosInstance } from "axios";

/** 服务端直连后端地址；部署时用环境变量覆盖（如 http://127.0.0.1:8080）。 */
const API_BASE = process.env.CMS_API_BASE || "http://127.0.0.1:8080";

const instance: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
});

/** 统一请求：code===200 返回 data；404 返回 null（内容缺失是正常分支，页面走兜底）。 */
export async function request<T = unknown>(
  url: string,
  params?: Record<string, string | number | undefined>,
): Promise<T | null> {
  const startedAt = Date.now();
  try {
    const res = await instance.get<{ code: number; msg: string; data: T }>(
      url,
      { params },
    );
    const body = res.data;
    const ms = Date.now() - startedAt;
    if (body.code === 200) {
      console.info(`[官网数据] 获取成功 ${url} → ${ms}ms`);
      return body.data;
    }
    if (body.code === 404) {
      console.info(`[官网数据] 内容不存在（走静态兜底）${url} → ${ms}ms`);
      return null;
    }
    throw new Error(body.msg || "请求失败");
  } catch (e: unknown) {
    // 404 可能以 HTTP 层 404 返回，同样归入「内容缺失」
    if (
      axios.isAxiosError(e) &&
      (e.response?.status === 404 || e.response?.data?.code === 404)
    ) {
      return null;
    }
    console.warn(`[官网数据] 获取失败（走静态兜底）${url} →`, (e as Error).message);
    throw e;
  }
}

export const CMS_API_BASE = API_BASE;
