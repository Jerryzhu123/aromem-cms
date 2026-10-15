import type { PageData } from "@/types/content";
import raw from "./pages.json";

/**
 * Every cloned page, keyed exactly like the extraction pass produced them:
 *   "/"                 → home
 *   "/about1.html"      → static pages keep their source path as key
 *   "news:49"           → /news_detail?id=49
 *   "product:5"         → /products?id=5
 *   "project:1"         → /projects?id=1
 *   "en-news:9"         → /en/news_detail?id=9
 *   "newslist-page:2"   → /news_list.html?p=2
 *
 * This module is server-only by convention (it is only imported from server
 * components) so the ~1 MB payload never reaches the browser bundle.
 */
export const pages = raw as unknown as Record<string, PageData>;

export function getPage(key: string): PageData | undefined {
  return pages[key];
}
