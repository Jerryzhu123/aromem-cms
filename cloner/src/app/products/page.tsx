import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClonedPage from "@/components/site/ClonedPage";
import { getPage } from "@/data/pages";
import { parseNumericId, type SearchParams } from "@/lib/params";

const DEFAULT_ID = 3;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const page = getPage(`en-product:${parseNumericId(sp.id, DEFAULT_ID)}`);
  return { title: page?.title ?? "PRODUCTS-AROMEM PTE. LTD. (SURO)" };
}

/** `/en_products?id=3.html` — seven English product pages. */
export default async function EnProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = getPage(`en-product:${parseNumericId(sp.id, DEFAULT_ID)}`);
  if (!page) notFound();

  return <ClonedPage page={page} lang="en" />;
}
