import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductView from "@/components/products/ProductView";
import DarllyDetailView from "@/components/products/DarllyDetailView";
import { pick } from "@/data/catalog";
import { catalogProductParams, getProduct, getSeries } from "@/lib/catalog-source";
/* darlly 三个品类的型号与正文 2026-10-21 起也在库里，渲染时经接口取 */
import {
  darllyCategory,
  darllyDetails,
  darllyItem,
  darllyProductParams,
} from "@/lib/darlly-source";
import PoolProductView from "@/components/products/PoolProductView";
/* 泳池数据来自后台接口的构建期快照，不再读编译期常量 */
import { getPoolItem, getPoolDetail, poolSlugs } from "@/lib/pool-source";

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
    /* 微孔折叠 / 大流量 / 多折共 50 条：同样构建期从后台接口取 */
    ...(await darllyProductParams()),
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
  /* darlly 型号的标题简介也走库：后台改型号名，搜索结果跟着变 */
  const darllyIt = await darllyItem(series, model);
  if (darllyIt) {
    return {
      title: darllyIt.name.en,
      description: `${darllyIt.model} — ${darllyIt.desc.en}`.slice(0, 300),
      alternates: { canonical: `/products/${series}/${model}` },
    };
  }
  const product = await getProduct(series, model);
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

  /* darlly 系列走原站详情页版式：英文页优先原厂英文正文，无英文原页则回退中文。
     分支判断放在 getProduct 之前 —— darlly 现在也在库里的型号清单中，
     先判断能少查一次库，也让「没有正文」的型号自然落到站内模板。 */
  const darllyCat = await darllyCategory(series);
  const darllyIt = await darllyItem(series, model);
  if (darllyCat && darllyIt) {
    const details = await darllyDetails(series, model);
    if (details.zh || details.en) {
      return (
        <DarllyDetailView
          category={darllyCat}
          item={darllyIt}
          details={details}
          locale="en"
        />
      );
    }
  }

  const product = await getProduct(series, model);
  if (!item || !product) notFound();

  return <ProductView series={item} product={product} locale="en" />;
}
