import type { Metadata } from "next";
import ProductTiles from "@/components/ProductTiles";
import { seriesKind } from "@/data/catalog";
import { PRODUCTS } from "@/data/site";
import { catalogSeries } from "@/lib/catalog-source";

export const metadata: Metadata = {
  title: "Products",
  description: PRODUCTS.intro,
};

/**
 * 产品中心：两条产品线，各用「一格一品类」的图标格子展示。
 *
 * 格子清单 2026-10-21 起在渲染时从后台取（lib/catalog-source），不再用静态常量：
 * 后台把某个系列下线，接口就不再返回它，这条线取到空，整个 section 连标题一起不渲染。
 * 之前是客户端取数 + 静态兜底，下线后反而被兜底格子顶了出来。
 *
 * PRODUCTS.lines 只保留版式文案（小标题、大标题），产品线与文案的对应关系是版式约定：
 * 第一条是工业滤芯线（filter），第二条是反渗透膜线（ro）。
 */
export default async function ProductsPage() {
  const all = await catalogSeries();
  const lines = [
    { kind: "filter" as const, copy: PRODUCTS.lines[0] },
    { kind: "ro" as const, copy: PRODUCTS.lines[1] },
  ];

  return (
    <>
      <div className="subhero">
        <div className="wrap">
          <div className="eyebrow">{PRODUCTS.eyebrow}</div>
          <h1>{PRODUCTS.title}</h1>
          <p>{PRODUCTS.intro}</p>
        </div>
      </div>

      {lines.map(({ kind, copy }, index) => {
        const scoped = all.filter((s) => seriesKind(s.slug) === kind);
        // 这条产品线一条系列都没有（全部下线或从未上架）→ 整段不渲染
        if (!copy || scoped.length === 0) return null;
        return (
          <section className={`section${index % 2 === 1 ? " soft" : ""}`} key={copy.title}>
            <div className="wrap">
              <div className="kicker">{copy.kicker}</div>
              <h2>{copy.title}</h2>
              <ProductTiles series={scoped} locale="en" contactHref="/contact" />
            </div>
          </section>
        );
      })}
    </>
  );
}
