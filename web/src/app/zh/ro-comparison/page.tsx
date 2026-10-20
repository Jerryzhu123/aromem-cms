import type { Metadata } from "next";
import RoComparisonView from "@/components/products/RoComparisonView";

export const metadata: Metadata = {
  title: "RO 膜技术参数对比",
  description:
    "10 款反渗透膜元件的厂家公布参数对比：产水量、稳定与最低脱盐率、膜面积，以及各系列对应的测试条件。",
  alternates: { canonical: "/zh/ro-comparison" },
};

export default function ZhRoComparisonPage() {
  return <RoComparisonView locale="zh" />;
}
