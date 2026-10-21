import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RoSelectionForm from "@/components/products/RoSelectionForm";
import { getProductsBySeries } from "@/lib/catalog-source";

/**
 * RO 选型询价页。型号下拉与后台在售型号一致：
 * 反渗透膜全部下架时这个页面 404，避免用户在一个没有可选项的表单里填半天。
 */
export const metadata: Metadata = {
  title: "RO Membrane Selection & RFQ",
  description:
    "Share feed TDS, temperature, operating pressure, target flow and recovery so we can recommend a suitable RO membrane series and prepare a quotation.",
  alternates: { canonical: "/ro-selection-guide" },
};

export default async function RoSelectionPage() {
  const models = await getProductsBySeries("ro-membranes");
  if (models.length === 0) notFound();
  return <RoSelectionForm locale="en" models={models.map((m) => m.slug)} />;
}
