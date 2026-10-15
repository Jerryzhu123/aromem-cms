import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClonedPage from "@/components/site/ClonedPage";
import { getClonedPage } from "@/services/cms/pageData";

export const metadata: Metadata = {
  title: "公司概况 - 苏州苏瑞膜纳米科技集团有限公司",
};

export default async function About1Page() {
  const page = await getClonedPage("/about1.html", "about1", "zh");
  if (!page) notFound();
  return <ClonedPage page={page} />;
}
