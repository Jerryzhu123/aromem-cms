import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductView from "@/components/products/ProductView";
import DarllyDetailView from "@/components/products/DarllyDetailView";
import { CATALOG_PRODUCTS, getSeries, pick } from "@/data/catalog";
import { DARLLY_ITEMS, getDarllyCategory, getDarllyItem } from "@/data/darlly";
import { getDarllyDetail } from "@/data/darlly-detail";
import PoolProductView from "@/components/products/PoolProductView";
/* 泳池数据来自后台接口的构建期快照，不再读编译期常量 */
import { getPoolItem, getPoolDetail, poolSlugs } from "@/lib/pool-source";
import { resolveCatalogProduct } from "@/data/darlly-adapter";

type PageProps = { params: Promise<{ series: string; model: string }> };

/** 预渲染清单：泳池型号构建期从接口拉取，之后新增的型号由动态参数按需生成 */
export async function generateStaticParams() {
  const poolList = await poolSlugs();
  const rows = [
    ...CATALOG_PRODUCTS.map((product) => ({
      series: product.seriesSlug,
      model: product.slug,
    })),
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
    if (!pool) return { title: "产品详情" };
    return {
      title: `${pool.sku} 泳池滤芯`,
      description: `${pool.sku} — 泳池与按摩浴缸替换滤芯，规格与外径、长度、接口尺寸见页面。`,
      alternates: { canonical: `/zh/products/pool/${pool.slug}` },
    };
  }
  const product = resolveCatalogProduct(series, model);
  if (!product) return { title: "产品详情" };
  return {
    title: product.name.zh,
    description: `${product.model} — ${pick(product.spec, "zh")}`,
    alternates: { canonical: `/zh/products/${series}/${model}` },
  };
}

export default async function ZhProductPage({ params }: PageProps) {
  const { series, model } = await params;

  /* 泳池滤芯走电商式单品页（与英文站同结构，只换文案语言） */
  if (series === "pool") {
    const poolItem = await getPoolItem(model);
    const poolDetail = await getPoolDetail(model);
    if (!poolItem || !poolDetail) notFound();
    return <PoolProductView item={poolItem} detail={poolDetail} locale="zh" />;
  }

  const item = getSeries(series);
  const product = resolveCatalogProduct(series, model);
  if (!item || !product) notFound();

  /* darlly 系列走原站详情页版式；没有正文数据的型号继续用站内模板 */
  const darllyCategory = getDarllyCategory(series);
  const darllyItem = getDarllyItem(series, model);
  if (darllyCategory && darllyItem && getDarllyDetail(darllyItem.slug)) {
    return (
      <DarllyDetailView
        category={darllyCategory}
        item={darllyItem}
        locale="zh"
      />
    );
  }

  return <ProductView series={item} product={product} locale="zh" />;
}
