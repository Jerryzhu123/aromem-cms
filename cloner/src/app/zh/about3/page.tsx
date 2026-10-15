import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClonedPage from "@/components/site/ClonedPage";
import { getClonedPage } from "@/services/cms/pageData";

export const metadata: Metadata = {
  title: "联系我们 - 苏州苏瑞膜纳米科技集团有限公司",
};

export default async function About3Page() {
  const page = await getClonedPage("/about3.html", "about3", "zh");
  if (!page) notFound();
  return <ClonedPage page={page} />;
}
