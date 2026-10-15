import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClonedPage from "@/components/site/ClonedPage";
import { getClonedPage } from "@/services/cms/pageData";

export const metadata: Metadata = {
  title: "知识产权、资质及企业荣誉 - 苏州苏瑞膜纳米科技集团有限公司",
};

export default async function About4Page() {
  const page = await getClonedPage("/about4.html", "about4", "zh");
  if (!page) notFound();
  return <ClonedPage page={page} />;
}
