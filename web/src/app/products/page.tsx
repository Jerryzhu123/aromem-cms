import type { Metadata } from "next";
import ProductTiles from "@/components/ProductTiles";
import { PRODUCTS } from "@/data/site";

export const metadata: Metadata = {
  title: "Products",
  description: PRODUCTS.intro,
};

/** 从卡片链接末段取系列 slug（/products/pleated → pleated），用于匹配本地兜底图标 */
function slugOf(href: string): string {
  const parts = href.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

/** 产品中心：两条产品线，各用「一格一品类」的图标格子展示 */
export default function ProductsPage() {
  return (
    <>
      <div className="subhero">
        <div className="wrap">
          <div className="eyebrow">{PRODUCTS.eyebrow}</div>
          <h1>{PRODUCTS.title}</h1>
          <p>{PRODUCTS.intro}</p>
        </div>
      </div>

      {PRODUCTS.lines.map((line, index) => (
        <section className={`section${index % 2 === 1 ? " soft" : ""}`} key={line.title}>
          <div className="wrap">
            <div className="kicker">{line.kicker}</div>
            <h2>{line.title}</h2>
            {/* 分类清单由后台 fc-series 维护，静态 HTML 内置默认格子兜底 */}
            <ProductTiles
              fallback={line.cards.map((card) => ({
                slug: slugOf(card.href),
                name: card.title,
                href: card.href,
              }))}
              locale="en"
              contactHref="/contact"
              line={line.cards.some((c) => c.href.includes("ro-membranes")) ? "ro" : "filter"}
            />
          </div>
        </section>
      ))}
    </>
  );
}
