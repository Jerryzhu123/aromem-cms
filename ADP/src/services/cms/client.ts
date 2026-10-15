/**
 * CMS 管理端 axios 二次封装（契约见 docs/frontend/api-template）。
 *
 * - 统一响应体 {code, msg, data}：HTTP 状态码与 code 同义（200/400/401/404/500）
 * - code === 200 时直接返回 data；否则抛错（msg 为提示文案）
 * - 请求头自动注入 Bearer JWT（localStorage cms_token）
 * - 401 时清 token 并跳登录页
 */
import axios, { AxiosRequestConfig } from 'axios';

const TOKEN_KEY = 'cms_token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};
export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

const instance = axios.create({
  baseURL: '',
  timeout: 30000,
});

instance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      clearToken();
      if (window.location.pathname !== '/user/login') {
        window.location.href = '/user/login';
      }
    }
    return Promise.reject(error);
  },
);

/** 统一请求：code===200 返回 data；HTTP 非 2xx 时优先取后端 msg 提示。 */
export async function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  let res;
  try {
    res = await instance.request<{ code: number; msg: string; data: T }>(
      config,
    );
  } catch (e: any) {
    const body = e?.response?.data;
    if (body?.msg) {
      throw new Error(body.msg);
    }
    throw e;
  }
  const body = res.data;
  if (body.code !== 200) {
    throw new Error(body.msg || '请求失败');
  }
  return body.data;
}

/** 分页响应体（后端 list 契约）。 */
export interface PageResult<T> {
  page: number;
  size: number;
  total: number;
  totalPages: number;
  items: T[];
}

/** 上传接口响应体。 */
export interface MediaUploadResult {
  fileId: string;
  filename: string;
  size: number;
  mime: string;
  relativeUrl: string;
}

/** 媒体上传（multipart，字段名 file），带进度回调。 */
export async function uploadMedia(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<MediaUploadResult> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await instance.post<{
    code: number;
    msg: string;
    data: MediaUploadResult;
  }>('/api/upload/media', fd, {
    timeout: 120000,
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
  if (res.data.code !== 200) {
    throw new Error(res.data.msg || '上传失败');
  }
  return res.data.data;
}

export default instance;
