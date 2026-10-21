import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RoComparisonView from "@/components/products/RoComparisonView";
import { getProductsBySeries } from "@/lib/catalog-source";

/**
 * RO 对比页（中文）。型号清单在渲染时从后台取，与产品中心同一套规则：
 * 后台把反渗透膜系列或它的型号全部下架，这个页面就 404，不留空表与死链。
 */
export async function generateMetadata(): Promise<Metadata> {
  const models = await getProductsBySeries("ro-membranes");
  return {
    title: "RO 膜技术参数对比",
    description:
      models.length > 0
        ? `${models.length} 款反渗透膜元件的厂家公布参数对比：产水量、稳定与最低脱盐率、膜面积，以及各系列对应的测试条件。`
        : "反渗透膜元件的厂家公布参数对比。",
    alternates: { canonical: "/zh/ro-comparison" },
  };
}

export default async function ZhRoComparisonPage() {
  const models = await getProductsBySeries("ro-membranes");
  if (models.length === 0) notFound();
  return <RoComparisonView locale="zh" models={models.map((m) => m.slug)} />;
}
