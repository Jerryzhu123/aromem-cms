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
  const page = getPage(`project:${parseNumericId(sp.id, DEFAULT_ID)}`);
  return { title: page?.title ?? "工程实例-苏州苏瑞膜纳米科技有限公司" };
}

/** `/projects?id=1.html` — five engineering case studies. */
export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = getPage(`project:${parseNumericId(sp.id, DEFAULT_ID)}`);
  if (!page) notFound();

  return <ClonedPage page={page} />;
}
