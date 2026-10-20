import type { Metadata } from "next";
import RoSelectionForm from "@/components/products/RoSelectionForm";

export const metadata: Metadata = {
  title: "反渗透膜选型与询价",
  description:
    "填写进水 TDS、温度、运行压力、目标产水量与回收率，我们据此推荐合适的反渗透膜系列并准备报价。",
  alternates: { canonical: "/zh/ro-selection-guide" },
};

export default function ZhRoSelectionPage() {
  return <RoSelectionForm locale="zh" />;
}
