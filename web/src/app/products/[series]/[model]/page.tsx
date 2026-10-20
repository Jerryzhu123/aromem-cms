import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductView from "@/components/products/ProductView";
import DarllyDetailView from "@/components/products/DarllyDetailView";
import { CATALOG_PRODUCTS, getSeries, pick } from "@/data/catalog";
import { DARLLY_ITEMS, getDarllyCategory, getDarllyItem } from "@/data/darlly";
import { getDarllyDetail } from "@/data/darlly-detail";
import { getDarllyDetailEn } from "@/data/darlly-detail-en";
import PoolProductView from "@/components/products/PoolProductView";
import { POOL_ITEMS, getPoolItem } from "@/data/pool";
import { getPoolDetail } from "@/data/pool-detail";
import { resolveCatalogProduct } from "@/data/darlly-adapter";

type PageProps = { params: Promise<{ series: string; model: string }> };

/** 静态导出：原有型号 + 复制品类新增型号的组合在构建期全部生成 */
export function generateStaticParams() {
  const rows = [
    ...CATALOG_PRODUCTS.map((product) => ({
      series: product.seriesSlug,
      model: product.slug,
    })),
    ...DARLLY_ITEMS.map(({ series, item }) => ({
      series,
      model: item.slug,
    })),
    /* 泳池滤芯：件号即 URL 段 */
    ...POOL_ITEMS.map((item) => ({ series: "pool", model: item.slug })),
  ];
  /* 去重：大流量有 5 款两边都有，重复参数会触发静态导出告警 */
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${row.series}/${row.model}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { series, model } = await params;
  if (series === "pool") {
    const pool = getPoolItem(model);
    if (!pool) return { title: "Product" };
    return {
      title: pool.name,
      description: `${pool.sku} — pool / spa replacement filter cartridge.`,
      alternates: { canonical: `/products/pool/${pool.slug}` },
    };
  }
  const product = resolveCatalogProduct(series, model);
  if (!product) return { title: "Product" };
  return {
    title: product.name.en,
    description: `${product.model} — ${pick(product.spec, "en")}`,
    alternates: { canonical: `/products/${series}/${model}` },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { series, model } = await params;

  /* 泳池滤芯走电商式单品页（对标 darllyfilter.com 商品页） */
  if (series === "pool") {
    const poolItem = getPoolItem(model);
    const poolDetail = getPoolDetail(model);
    if (!poolItem || !poolDetail) notFound();
    return <PoolProductView item={poolItem} detail={poolDetail} locale="en" />;
  }

  const item = getSeries(series);
  const product = resolveCatalogProduct(series, model);
  if (!item || !product) notFound();

  /* darlly 系列走原站详情页版式：英文页优先原厂英文正文，无英文原页则回退中文 */
  const darllyCategory = getDarllyCategory(series);
  const darllyItem = getDarllyItem(series, model);
  if (
    darllyCategory &&
    darllyItem &&
    (getDarllyDetailEn(darllyItem.slug) || getDarllyDetail(darllyItem.slug))
  ) {
    return (
      <DarllyDetailView
        category={darllyCategory}
        item={darllyItem}
        locale="en"
      />
    );
  }

  return <ProductView series={item} product={product} locale="en" />;
}
