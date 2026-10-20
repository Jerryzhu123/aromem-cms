/**
 * 内容接口层：新站从后端拉取「后台可维护」的内容。
 *
 * 数据源（福建利祥博官网 server，Nginx 把 /api/v1 同源反代到 8080）：
 * - GET /api/v1/fc-series       滤芯系列清单（双语全量，ADP「fc-series」域维护）
 * - GET /api/v1/site/bootstrap  站点外壳（含 footer.contact 联系方式）
 *
 * 契约与后端 PublicDtos 逐字段对齐（服务端类是 package-private，
 * 这里按其 JSON 输出形状定义 TS 类型，字段名禁止随意改动）。
 *
 * 取数策略——fetch-with-fallback：
 * 页面静态 HTML 内置 src/data/site.ts 的默认文案（保证首屏 SEO 与
 * 后端不可用时的兜底），客户端水合后拉取后台数据，拉到非空则覆盖。
 * 因此所有拉取函数失败时返回 null，由调用方决定回退，绝不抛错打断渲染。
 *
 * 语言：新站为英文站（面向美国 B2B 客户），固定 locale=en-US。
 */
import { get } from "@/lib/request";
import { useEffect, useState } from "react";

/** 对齐后端 PublicDtos.SeriesItem（双语全量，前台按语言自取英文字段） */
export interface FilterSeries {
  id: number;
  slug: string;
  nameZh: string;
  nameEn: string;
  taglineZh: string;
  taglineEn: string;
  facetsZh: string[];
  facetsEn: string[];
  /** 分类图标（媒体库 relativeUrl，如 /media/2026/10/xxx.png）；未配为空 */
  iconUrl?: string | null;
  comingSoon: boolean;
}

/** 对齐后端 BootstrapView.FooterView.ContactInfo */
export interface SiteContact {
  title: string;
  address: string;
  phone: string;
  qr: string;
  emails: string[];
}

const LOCALE = "en-US";

/**
 * 滤芯系列清单（按语言取字段：英文站取 nameEn 系，中文站取 nameZh 系）。
 * 返回 null = 后端不可达 / 无数据 / 对应语言内容缺失，调用方回退内置文案。
 */
export async function fetchFilterSeries(
  locale: "en" | "zh" = "en",
): Promise<FilterSeries[] | null> {
  const data = await get<FilterSeries[]>("/api/v1/fc-series", {
    locale: locale === "zh" ? "zh-CN" : "en-US",
  });
  if (!data || data.length === 0) return null;
  // 后端按 locale 过滤；此处再兜一层：对应语言字段缺失的条目不展示
  const list = data.filter((s) =>
    locale === "zh" ? s.nameZh?.trim() : s.nameEn?.trim(),
  );
  return list.length > 0 ? list : null;
}

/**
 * 站点联系方式（后台「站点外壳 → 页脚联系方式」维护）。
 * 返回 null = 拉取失败或联系方式为空，调用方回退内置占位。
 */
export async function fetchSiteContact(): Promise<SiteContact | null> {
  const data = await get<{ footer?: { contact?: SiteContact } }>(
    "/api/v1/site/bootstrap",
    { locale: LOCALE },
  );
  const contact = data?.footer?.contact;
  if (!contact) return null;
  const hasAny =
    contact.address?.trim() ||
    contact.phone?.trim() ||
    contact.emails?.some((e) => e?.trim());
  return hasAny ? contact : null;
}

/**
 * 联系方式 Hook（仅限客户端组件调用）。
 * 初始为 null（SSG 首屏无联系方式，不留占位垃圾），水合后拉到后台
 * 数据才置值——后台回填真实联系方式后前台自动生效，无需改代码重建。
 */
export function useSiteContact(): SiteContact | null {
  const [contact, setContact] = useState<SiteContact | null>(null);
  useEffect(() => {
    let alive = true;
    fetchSiteContact().then((data) => {
      if (alive && data) setContact(data);
    });
    return () => {
      alive = false;
    };
  }, []);
  return contact;
}
