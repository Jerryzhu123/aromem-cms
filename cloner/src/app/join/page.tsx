import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClonedPage from "@/components/site/ClonedPage";
import { getClonedPage } from "@/services/cms/pageData";

export const metadata: Metadata = {
  title: "Join us - 苏州苏瑞膜纳米科技集团有限公司",
};

export default async function EnJoinPage() {
  const page = await getClonedPage("/en_join.html", "join", "en");
  if (!page) notFound();
  return <ClonedPage page={page} lang="en" />;
}
