/**
 * 前端请求二次封装（axios 单例 + 拦截器）。
 *
 * 统一契约：后端响应体为 {code, msg, data}，HTTP 状态码与 code 同义
 * （200 成功 / 400 参数错误 / 404 不存在 / 500 服务器错误）。
 *
 * - get<T>()：code===200 返回 data；404 返回 null（内容缺失是正常分支）；
 * - post<T>()：提交类接口，失败时抛出带中文语义的错误，由调用方提示用户；
 * - 日志全部使用中文语义化描述，便于人工排查（项目约定）；
 * - 接口地址：默认走相对路径 /api/v1（生产环境由 Nginx 代理到后端 8080，
 *   同源无跨域）；本地开发可用环境变量 NEXT_PUBLIC_API_BASE 覆盖。
 */
import axios, { AxiosError, AxiosInstance } from "axios";

/** 给 axios 请求配置扩展耗时统计字段（拦截器用） */
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    metadata?: { startedAt: number };
  }
}

/** 业务响应体外壳 */
interface ApiBody<T> {
  code: number;
  msg: string;
  data: T;
}

/** 把底层错误翻译成用户能看懂的中文提示 */
function humanizeError(e: unknown): string {
  if (axios.isAxiosError(e)) {
    if (e.code === "ECONNABORTED") return "请求超时，请稍后重试";
    if (!e.response) return "网络连接失败，请检查网络后重试";
    const body = e.response.data as Partial<ApiBody<unknown>> | undefined;
    if (body?.msg) return body.msg;
    const status = e.response.status;
    if (status === 400) return "提交的信息不完整或有误，请检查后重试";
    if (status === 404) return "接口不存在，请联系网站管理员";
    if (status >= 500) return "服务器开小差了，请稍后重试";
    return `请求失败（状态码 ${status}）`;
  }
  return "发生未知错误，请稍后重试";
}

const instance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || "",
  timeout: 10000,
});

/* ---------- 拦截器 ---------- */

instance.interceptors.request.use((config) => {
  config.metadata = { startedAt: Date.now() };
  return config;
});

instance.interceptors.response.use(
  (res) => {
    const ms = res.config.metadata?.startedAt
      ? Date.now() - res.config.metadata.startedAt
      : 0;
    console.info(
      `[官网请求] 成功 ${res.config.method?.toUpperCase()} ${res.config.url} → ${ms}ms`,
    );
    return res;
  },
  (error: AxiosError) => {
    const url = error.config?.url ?? "(未知地址)";
    console.warn(`[官网请求] 失败 ${url} →`, humanizeError(error));
    return Promise.reject(error);
  },
);

/* ---------- 对外方法 ---------- */

/** GET：code===200 返回 data；404 返回 null（内容缺失是正常分支） */
export async function get<T = unknown>(
  url: string,
  params?: Record<string, string | number | undefined>,
): Promise<T | null> {
  try {
    const res = await instance.get<ApiBody<T>>(url, { params });
    if (res.data.code === 200) return res.data.data;
    if (res.data.code === 404) return null;
    throw new Error(res.data.msg || "请求失败");
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) return null;
    throw new Error(humanizeError(e));
  }
}

/** POST：提交类接口；成功返回 data，失败抛中文语义错误，由调用方提示用户 */
export async function post<T = unknown>(
  url: string,
  data?: unknown,
): Promise<T> {
  try {
    const res = await instance.post<ApiBody<T>>(url, data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.msg || "提交失败");
  } catch (e) {
    throw new Error(humanizeError(e));
  }
}
