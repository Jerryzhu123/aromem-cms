import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClonedPage from "@/components/site/ClonedPage";
import { getClonedPage } from "@/services/cms/pageData";

export const metadata: Metadata = {
  title: "企业文化 - 苏州苏瑞膜纳米科技集团有限公司",
};

export default async function About2Page() {
  const page = await getClonedPage("/about2.html", "about2", "zh");
  if (!page) notFound();
  return <ClonedPage page={page} />;
}
