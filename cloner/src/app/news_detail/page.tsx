import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClonedPage from "@/components/site/ClonedPage";
import { getPage } from "@/data/pages";
import { parseNumericId, type SearchParams } from "@/lib/params";

/** Newest English article on the source site. */
const DEFAULT_ID = 31;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const page = getPage(`en-news:${parseNumericId(sp.id, DEFAULT_ID)}`);
  return { title: page?.title ?? "NEWS-AROMEM PTE. LTD. (SURO)" };
}

/** `/en_news_detail?id=31.html` — 13 English articles. */
export default async function EnNewsDetailPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = getPage(`en-news:${parseNumericId(sp.id, DEFAULT_ID)}`);
  if (!page) notFound();

  return <ClonedPage page={page} lang="en" />;
}
