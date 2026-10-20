import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DarllyCategoryView from "@/components/products/DarllyCategoryView";
import SeriesView from "@/components/products/SeriesView";
import { CATALOG_SERIES, getProductsBySeries, getSeries } from "@/data/catalog";
import { getDarllyCategory } from "@/data/darlly";
import { poolCategory } from "@/lib/pool-source";

type PageProps = { params: Promise<{ series: string }> };

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
      title: darlly.crumb.zh,
      description: `${darlly.crumb.zh}——共 ${darlly.items.length} 个产品系列，覆盖多种滤材与结构形式。`,
      alternates: { canonical: `/zh/products/${darlly.slug}` },
    };
  }
  const item = getSeries(series);
  if (!item) return { title: "产品中心" };
  return {
    title: item.name.zh,
    description: item.tagline.zh,
    alternates: { canonical: `/zh/products/${item.slug}` },
  };
}

export default async function ZhSeriesPage({ params }: PageProps) {
  const { series } = await params;

  /* 已完整复制的三个品类（微孔折叠 / 大流量 / 多折）走 darlly 版式 */
  const darlly = getDarllyCategory(series);
  if (darlly) {
    return <DarllyCategoryView category={darlly} locale="zh" />;
  }

  /* 泳池滤芯：版式与其他品类一致，数据来自后台接口的构建期快照（lib/pool-source） */
  if (series === "pool") {
    const pool = poolCategory();
    if (pool.items.length > 0) {
      return <DarllyCategoryView category={pool} locale="zh" />;
    }
  }

  const item = getSeries(series);
  if (!item) notFound();

  return (
    <SeriesView
      series={item}
      products={getProductsBySeries(item.slug)}
      locale="zh"
    />
  );
}
