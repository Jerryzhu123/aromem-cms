import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClonedPage from "@/components/site/ClonedPage";
import { getClonedPage } from "@/services/cms/pageData";

export const metadata: Metadata = {
  title: "Enterprise culture - 苏州苏瑞膜纳米科技集团有限公司",
};

export default async function EnAbout2Page() {
  const page = await getClonedPage("/en_about2.html", "about2", "en");
  if (!page) notFound();
  return <ClonedPage page={page} lang="en" />;
}
