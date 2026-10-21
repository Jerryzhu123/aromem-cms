import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductView from "@/components/products/ProductView";
import DarllyDetailView from "@/components/products/DarllyDetailView";
import { pick } from "@/data/catalog";
import { catalogProductParams, getSeries } from "@/lib/catalog-source";
import { DARLLY_ITEMS, getDarllyCategory, getDarllyItem } from "@/data/darlly";
import { getDarllyDetail } from "@/data/darlly-detail";
import { getDarllyDetailEn } from "@/data/darlly-detail-en";
import PoolProductView from "@/components/products/PoolProductView";
/* 泳池数据来自后台接口的构建期快照，不再读编译期常量 */
import { getPoolItem, getPoolDetail, poolSlugs } from "@/lib/pool-source";
import { resolveCatalogProduct } from "@/data/darlly-adapter";

type PageProps = { params: Promise<{ series: string; model: string }> };

/**
 * 预渲染清单。泳池滤芯的型号清单在构建期从后台接口拉取；
 * 后台后来新增、未在清单里的型号由动态参数按需生成，不会 404。
 */
export async function generateStaticParams() {
  const poolList = await poolSlugs();
  const rows = [
    /* 工业滤芯 25 条：2026-10-21 起在构建期从后台接口取，不再是编译期常量 */
    ...(await catalogProductParams()),
    ...DARLLY_ITEMS.map(({ series, item }) => ({
      series,
      model: item.slug,
    })),
    /* 泳池滤芯：件号即网址段 */
    ...poolList.map((slug) => ({ series: "pool", model: slug })),
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
    const pool = await getPoolItem(model);
    if (!pool) return { title: "Product" };
    return {
      title: pool.name,
      description: `${pool.sku} — pool / spa replacement filter cartridge.`,
      alternates: { canonical: `/products/pool/${pool.slug}` },
    };
  }
  const product = await resolveCatalogProduct(series, model);
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
    const poolItem = await getPoolItem(model);
    const poolDetail = await getPoolDetail(model);
    if (!poolItem || !poolDetail) notFound();
    return <PoolProductView item={poolItem} detail={poolDetail} locale="en" />;
  }

  const item = await getSeries(series);
  const product = await resolveCatalogProduct(series, model);
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
