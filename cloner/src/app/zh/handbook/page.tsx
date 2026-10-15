import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClonedPage from "@/components/site/ClonedPage";
import { getClonedPage } from "@/services/cms/pageData";
import { fcAlternates } from "@/lib/fcSeo";

export const metadata: Metadata = {
  title: "产品手册 - 苏州苏瑞膜纳米科技集团有限公司",
  alternates: fcAlternates("zh", "/zh/handbook"),
};

export default async function HandbookPage() {
  const page = await getClonedPage("/handbook.html", "handbook", "zh");
  if (!page) notFound();
  return <ClonedPage page={page} />;
}
