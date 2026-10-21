import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RoComparisonView from "@/components/products/RoComparisonView";
import { getProductsBySeries } from "@/lib/catalog-source";

/**
 * RO 对比页。型号清单在渲染时从后台取，与产品中心同一套规则：
 * 后台把反渗透膜系列或它的型号全部下架，这个页面就 404，不留空表与死链。
 */
export async function generateMetadata(): Promise<Metadata> {
  const models = await getProductsBySeries("ro-membranes");
  return {
    title: "RO Membrane Technical Comparison",
    description:
      models.length > 0
        ? `Compare manufacturer-published specifications for ${models.length} RO membrane models: permeate flow, stabilized and minimum rejection, membrane area, and the test conditions behind each figure.`
        : "RO membrane technical comparison.",
    alternates: { canonical: "/ro-comparison" },
  };
}

export default async function RoComparisonPage() {
  const models = await getProductsBySeries("ro-membranes");
  if (models.length === 0) notFound();
  return <RoComparisonView locale="en" models={models.map((m) => m.slug)} />;
}
