import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DarllyCategoryView from "@/components/products/DarllyCategoryView";
import SeriesView from "@/components/products/SeriesView";
import { CATALOG_SERIES, getProductsBySeries, getSeries } from "@/data/catalog";
import { getDarllyCategory } from "@/data/darlly";
import { POOL_CATEGORY } from "@/data/pool";

type PageProps = { params: Promise<{ series: string }> };

/** 静态导出：系列页路由清单在构建期确定 */
export function generateStaticParams() {
  return CATALOG_SERIES.map((series) => ({ series: series.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { series } = await params;
  const darlly = getDarllyCategory(series);
  if (darlly) {
    return {
      title: darlly.crumb.en,
      description: `${darlly.crumb.en} — ${darlly.items.length} product families with media and construction options for industrial liquid filtration.`,
      alternates: { canonical: `/products/${darlly.slug}` },
    };
  }
  const item = getSeries(series);
  if (!item) return { title: "Products" };
  return {
    title: item.name.en,
    description: item.tagline.en,
    alternates: { canonical: `/products/${item.slug}` },
  };
}

export default async function SeriesPage({ params }: PageProps) {
  const { series } = await params;

  /* 已完整复制的三个品类（微孔折叠 / 大流量 / 多折）走 darlly 版式 */
  const darlly = getDarllyCategory(series);
  if (darlly) {
    return <DarllyCategoryView category={darlly} locale="en" />;
  }

  /* 泳池滤芯：版式与其他品类一致，数据来自 darllyfilter.com（见 data/pool.ts） */
  if (series === "pool" && POOL_CATEGORY.items.length > 0) {
    return <DarllyCategoryView category={POOL_CATEGORY} locale="en" />;
  }

  const item = getSeries(series);
  if (!item) notFound();

  return (
    <SeriesView
      series={item}
      products={getProductsBySeries(item.slug)}
      locale="en"
    />
  );
}
