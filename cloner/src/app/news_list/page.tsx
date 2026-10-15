import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClonedPage from "@/components/site/ClonedPage";
import { getPage } from "@/data/pages";
import { parsePageNumber, type SearchParams } from "@/lib/params";

export const metadata: Metadata = {
  title: "NEWS-AROMEM PTE. LTD. (SURO)",
};

/** `/en_news_list.html` and `/en_news_list.html?p=2`. */
export default async function EnNewsListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const pageNo = parsePageNumber(sp.p, 1, 2);
  const page =
    pageNo === 1
      ? getPage("/en_news_list.html")
      : getPage(`en-newslist-page:${pageNo}`);
  if (!page) notFound();

  return <ClonedPage page={page} lang="en" />;
}
