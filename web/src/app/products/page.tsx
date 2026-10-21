import type { Metadata } from "next";
import ProductTiles from "@/components/ProductTiles";
import { type CatalogSeries, seriesKind } from "@/data/catalog";
import { PRODUCTS } from "@/data/site";
import { allSeries } from "@/lib/catalog-source";

/**
 * 产品中心：两条产品线，各用「一格一品类」的图标格子展示。
 *
 * 格子清单 2026-10-21 起在渲染时从后台取（lib/catalog-source），不再用静态常量：
 * 后台把某个系列下线，接口就不再返回它，这条线取到空，整个 section 连标题一起不渲染。
 * 之前是客户端取数 + 静态兜底，下线后反而被兜底格子顶了出来。
 *
 * 大标题同样不写死：只把「确实有系列」的产品线名字拼起来。
 * 两条线都在 = 「工业滤芯与反渗透膜」，只剩一条就只写那一条。
 *
 * PRODUCTS.lines 只保留每条线的版式文案（小标题、大标题），
 * 产品线与文案的对应关系是版式约定：第一条是工业滤芯线（filter），第二条是反渗透膜线（ro）。
 */
function buildLines(all: CatalogSeries[]) {
  return [
    { kind: "filter" as const, copy: PRODUCTS.lines[0] },
    { kind: "ro" as const, copy: PRODUCTS.lines[1] },
  ]
    .map((line) => ({
      ...line,
      series: all.filter((s) => seriesKind(s.slug) === line.kind),
    }))
    // 一条系列都没有的产品线整段不渲染（后台下线即消失，不需要改代码）
    .filter((line) => line.copy && line.series.length > 0);
}

function pageTitle(lines: ReturnType<typeof buildLines>): string {
  const names = lines.map((line) => line.copy.title);
  return names.length > 0 ? names.join(PRODUCTS.titleJoiner) : PRODUCTS.eyebrow;
}

export async function generateMetadata(): Promise<Metadata> {
  const lines = buildLines(await allSeries());
  return {
    title: pageTitle(lines),
    description: PRODUCTS.intro,
  };
}

export default async function ProductsPage() {
  const lines = buildLines(await allSeries());

  return (
    <>
      <div className="subhero">
        <div className="wrap">
          <div className="eyebrow">{PRODUCTS.eyebrow}</div>
          <h1>{pageTitle(lines)}</h1>
          <p>{PRODUCTS.intro}</p>
        </div>
      </div>

      {lines.map((line, index) => (
        <section
          className={`section${index % 2 === 1 ? " soft" : ""}`}
          key={line.kind}
        >
          <div className="wrap">
            <div className="kicker">{line.copy.kicker}</div>
            <h2>{line.copy.title}</h2>
            <ProductTiles series={line.series} locale="en" contactHref="/contact" />
          </div>
        </section>
      ))}
    </>
  );
}
