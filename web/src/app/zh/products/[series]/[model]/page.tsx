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

/** 预渲染清单：泳池型号构建期从接口拉取，之后新增的型号由动态参数按需生成 */
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
    if (!pool) return { title: "产品详情" };
    return {
      title: `${pool.sku} 泳池滤芯`,
      description: `${pool.sku} — 泳池与按摩浴缸替换滤芯，规格与外径、长度、接口尺寸见页面。`,
      alternates: { canonical: `/zh/products/pool/${pool.slug}` },
    };
  }
  /* darlly 型号的标题简介也走库：后台改型号名，搜索结果跟着变 */
  const darllyIt = await darllyItem(series, model);
  if (darllyIt) {
    return {
      title: darllyIt.name.zh,
      description: `${darllyIt.model} — ${darllyIt.desc.zh}`.slice(0, 300),
      alternates: { canonical: `/zh/products/${series}/${model}` },
    };
  }
  const product = await getProduct(series, model);
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

  const item = await getSeries(series);

  /* darlly 系列走原站详情页版式；没有正文数据的型号继续用站内模板。
     中文页只取中文正文，英文正文不参与回退（英文页反过来）。 */
  const darllyCat = await darllyCategory(series);
  const darllyIt = await darllyItem(series, model);
  if (darllyCat && darllyIt) {
    const details = await darllyDetails(series, model);
    if (details.zh) {
      return (
        <DarllyDetailView
          category={darllyCat}
          item={darllyIt}
          details={details}
          locale="zh"
        />
      );
    }
  }

  const product = await getProduct(series, model);
  if (!item || !product) notFound();

  return <ProductView series={item} product={product} locale="zh" />;
}
