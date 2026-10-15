import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClonedPage from "@/components/site/ClonedPage";
import { getPage } from "@/data/pages";
import { parseNumericId, type SearchParams } from "@/lib/params";

const DEFAULT_ID = 1;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const page = getPage(`en-project:${parseNumericId(sp.id, DEFAULT_ID)}`);
  return { title: page?.title ?? "ENGINEERING EXAMPLES-AROMEM PTE. LTD. (SURO)" };
}

/** `/en_projects?id=1.html` — five English case studies. */
export default async function EnProjectsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = getPage(`en-project:${parseNumericId(sp.id, DEFAULT_ID)}`);
  if (!page) notFound();

  return <ClonedPage page={page} lang="en" />;
}
