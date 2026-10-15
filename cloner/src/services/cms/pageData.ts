/**
 * 单页数据组装：本地 pages.json 为骨架（banner/面包屑/兜底正文），
 * 后端 /api/v1/pages/{code} 的富文本可用时替换正文。
 *
 * 好处：ADP 后台改「关于我们 / 加入我们」，官网即时生效；
 * 后端不可达时整页退回打包时的静态内容，页面永不白屏。
 */
import type { PageData } from "@/types/content";
import { getPage } from "@/data/pages";
import { getPageContent } from "./api";

export async function getClonedPage(
  key: string,
  code: string,
  lang: "zh" | "en",
): Promise<PageData | null> {
  const base = getPage(key);
  if (!base) return null;
  const html = await getPageContent(code, lang);
  return html ? { ...base, content: html } : base;
}
