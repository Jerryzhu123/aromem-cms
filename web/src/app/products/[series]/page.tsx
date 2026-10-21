import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DarllyCategoryView from "@/components/products/DarllyCategoryView";
import SeriesView from "@/components/products/SeriesView";
import { getDarllyCategory } from "@/data/darlly";
import {
  catalogSeriesSlugs,
  getProductsBySeries,
  getSeries,
} from "@/lib/catalog-source";
import { poolCategory } from "@/lib/pool-source";

type PageProps = { params: Promise<{ series: string }> };

/**
 * 路由清单在构建期从后台接口取（2026-10-21 起不再是编译期常量）。
 * 泳池不属于工业滤芯数据源，但它也是一个系列页，单独补上。
 * 后台后来新增、不在清单里的系列由动态参数按需生成，不会 404。
 */
export async function generateStaticParams() {
  const slugs = await catalogSeriesSlugs();
  return [...slugs, "pool"].map((series) => ({ series }));
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
  const item = await getSeries(series);
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

  /* 泳池滤芯：版式与其他品类一致，数据运行时从后台接口取（lib/pool-source） */
  if (series === "pool") {
    const pool = await poolCategory();
    if (pool.items.length > 0) {
      return <DarllyCategoryView category={pool} locale="en" />;
    }
  }

  const item = await getSeries(series);
  if (!item) notFound();

  return (
    <SeriesView
      series={item}
      products={await getProductsBySeries(item.slug)}
      locale="en"
    />
  );
}
