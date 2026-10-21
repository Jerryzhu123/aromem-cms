import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RoSelectionForm from "@/components/products/RoSelectionForm";
import { getProductsBySeries } from "@/lib/catalog-source";

/**
 * RO 选型询价页（中文）。型号下拉与后台在售型号一致：
 * 反渗透膜全部下架时这个页面 404，避免用户在一个没有可选项的表单里填半天。
 */
export const metadata: Metadata = {
  title: "反渗透膜选型与询价",
  description:
    "填写进水 TDS、温度、运行压力、目标产水量与回收率，我们据此推荐合适的反渗透膜系列并准备报价。",
  alternates: { canonical: "/zh/ro-selection-guide" },
};

export default async function ZhRoSelectionPage() {
  const models = await getProductsBySeries("ro-membranes");
  if (models.length === 0) notFound();
  return <RoSelectionForm locale="zh" models={models.map((m) => m.slug)} />;
}
