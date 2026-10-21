import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DarllyCategoryView from "@/components/products/DarllyCategoryView";
import SeriesView from "@/components/products/SeriesView";
import { catalogSeriesSlugs, getProductsBySeries, getSeries } from "@/lib/catalog-source";
import { darllyCategory } from "@/lib/darlly-source";
import { poolCategory } from "@/lib/pool-source";

type PageProps = { params: Promise<{ series: string }> };

/**
 * 路由清单在构建期从后台接口取（2026-10-21 起不再是编译期常量）。
 * 泳池不属于工业滤芯数据源，但它也是一个系列页，单独补上。
 */
export async function generateStaticParams() {
  const slugs = await catalogSeriesSlugs();
  return [...slugs, "pool"].map((series) => ({ series }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { series } = await params;
  const darlly = await darllyCategory(series);
  if (darlly) {
    return {
      title: darlly.crumb.zh,
      description: `${darlly.crumb.zh}——共 ${darlly.items.length} 个产品系列，覆盖多种滤材与结构形式。`,
      alternates: { canonical: `/zh/products/${darlly.slug}` },
    };
  }
  const item = await getSeries(series);
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
  const darlly = await darllyCategory(series);
  if (darlly) {
    return <DarllyCategoryView category={darlly} locale="zh" />;
  }

  /* 泳池滤芯：版式与其他品类一致，数据运行时从后台接口取（lib/pool-source） */
  if (series === "pool") {
    const pool = await poolCategory();
    if (pool.items.length > 0) {
      return <DarllyCategoryView category={pool} locale="zh" />;
    }
  }

  const item = await getSeries(series);
  if (!item) notFound();

  return (
    <SeriesView
      series={item}
      products={await getProductsBySeries(item.slug)}
      locale="zh"
    />
  );
}
