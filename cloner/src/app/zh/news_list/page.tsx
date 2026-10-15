import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClonedPage from "@/components/site/ClonedPage";
import { getPage } from "@/data/pages";
import { parsePageNumber, type SearchParams } from "@/lib/params";

export const metadata: Metadata = {
  title: "新闻资讯-苏州苏瑞膜纳米科技有限公司",
};

/** `/news_list.html` and `/news_list.html?p=2..4` — four paginated pages. */
export default async function NewsListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const pageNo = parsePageNumber(sp.p, 1, 4);
  const page =
    pageNo === 1
      ? getPage("/news_list.html")
      : getPage(`newslist-page:${pageNo}`);
  if (!page) notFound();

  return <ClonedPage page={page} />;
}
