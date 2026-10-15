import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClonedPage from "@/components/site/ClonedPage";
import { getPage } from "@/data/pages";
import { parseNumericId, type SearchParams } from "@/lib/params";

/** Newest article on the source site; used when no `?id=` is supplied. */
const DEFAULT_ID = 49;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const page = getPage(`news:${parseNumericId(sp.id, DEFAULT_ID)}`);
  return { title: page?.title ?? "新闻资讯-苏州苏瑞膜纳米科技有限公司" };
}

/** `/news_detail?id=49.html` and `/news_detail.html?id=49` — 36 articles. */
export default async function NewsDetailPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = getPage(`news:${parseNumericId(sp.id, DEFAULT_ID)}`);
  if (!page) notFound();

  return <ClonedPage page={page} />;
}
