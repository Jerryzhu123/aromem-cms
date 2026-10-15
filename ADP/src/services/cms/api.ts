/**
 * CMS 管理端域 API：11 个管理域共用泛化 CRUD（后端 /api/v1/admin/{domain}）。
 * 域名与后端 AdminContentService.DOMAINS 一一对应。
 */
import { request, PageResult } from './client';

export const CMS_DOMAINS = [
  'articles',
  'products',
  'product-categories',
  'projects',
  'pages',
  'downloads',
  'home-slides',
  'home-about-cards',
  'home-video',
  'home-sections',
  'home-tiles',
  'fc-series',
  'fc-products',
  'cross-reference',
  'rfq',
  'media',
] as const;

export type CmsDomain = (typeof CMS_DOMAINS)[number];

export interface LoginResult {
  token: string;
  expiresIn: number;
  user: { username: string; displayName?: string; roles?: string[] };
}

/** 行数据：后端 list/detail 返回库列 snake_case 键。 */
export type CmsRow = Record<string, any>;

export const cmsApi = {
  login: (username: string, password: string) =>
    request<LoginResult>({
      url: '/api/v1/admin/auth/login',
      method: 'POST',
      data: { username, password },
    }),

  me: () => request<CmsRow>({ url: '/api/v1/admin/auth/me', method: 'GET' }),

  list: (domain: string, params: Record<string, any>) =>
    request<PageResult<CmsRow>>({
      url: `/api/v1/admin/${domain}`,
      method: 'GET',
      params,
    }),

  detail: (domain: string, id: number | string) =>
    request<CmsRow>({ url: `/api/v1/admin/${domain}/${id}`, method: 'GET' }),

  create: (domain: string, data: Record<string, any>) =>
    request<{ id: number }>({
      url: `/api/v1/admin/${domain}`,
      method: 'POST',
      data,
    }),

  update: (domain: string, id: number | string, data: Record<string, any>) =>
    request<void>({
      url: `/api/v1/admin/${domain}/${id}`,
      method: 'PUT',
      data,
    }),

  remove: (domain: string, id: number | string) =>
    request<void>({ url: `/api/v1/admin/${domain}/${id}`, method: 'DELETE' }),

  /** 批量上下线：{ids, status}，仅 PUBLISHED / OFFLINE / DRAFT。 */
  batchStatus: (domain: string, ids: number[], status: string) =>
    request<void>({
      url: `/api/v1/admin/${domain}/batch-status`,
      method: 'PUT',
      data: { ids, status },
    }),
};
