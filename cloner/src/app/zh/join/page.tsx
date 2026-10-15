import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClonedPage from "@/components/site/ClonedPage";
import { getClonedPage } from "@/services/cms/pageData";

export const metadata: Metadata = {
  title: "加入我们 - 苏州苏瑞膜纳米科技集团有限公司",
};

export default async function JoinPage() {
  const page = await getClonedPage("/join.html", "join", "zh");
  if (!page) notFound();
  return <ClonedPage page={page} />;
}
