import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClonedPage from "@/components/site/ClonedPage";
import { getPage } from "@/data/pages";
import { parseNumericId, type SearchParams } from "@/lib/params";

/** First entry of the source site's product menu. */
const DEFAULT_ID = 22;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const page = getPage(`product:${parseNumericId(sp.id, DEFAULT_ID)}`);
  return { title: page?.title ?? "产品中心-苏州苏瑞膜纳米科技有限公司" };
}

/** `/products?id=5.html` and `/products.html?id=5` — 12 product pages. */
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = getPage(`product:${parseNumericId(sp.id, DEFAULT_ID)}`);
  if (!page) notFound();

  return <ClonedPage page={page} />;
}
