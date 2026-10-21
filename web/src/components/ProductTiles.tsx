/**
 * 产品分类格子（产品中心页）。
 *
 * 2026-10-21 改：从「客户端 fetch + 静态兜底」改成服务端取数。
 *
 * 为什么改：原逻辑是「接口返回的这一条产品线有内容才用接口，否则用内置静态格子」。
 * 后台把「反渗透膜」系列下线后，接口不再返回它 → 这条线取到空 → 反而命中静态兜底，
 * 把已经下线的格子又画了出来。等于把「接口正常、这条线确实一条都没有」
 * 误判成了「接口没拿到数据」。
 *
 * 现在格子清单完全由 lib/catalog-source.ts 决定，服务端直出进 HTML：
 * 接口说有几条就显示几条，一条都没有这段整块不渲染，客户端不再参与判断。
 * 后台增删系列、改名、调顺序、下线，由缓存标签 catalog 触发重新渲染，刷新即见。
 *
 * 图标优先用后台配的（fc_series.icon_url → 媒体库），没配才回落到本地线描图
 * （data/tiles.ts）。接口 2026-10-21 起才返回 iconUrl，此前后台配了也传不过来。
 */
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { type CatalogSeries, hasSeries, pick } from "@/data/catalog";
import { tileIconOf } from "@/data/tiles";

export default function ProductTiles({
  series,
  locale = "en",
  contactHref,
}: {
  /** 已按产品线筛好的系列清单，顺序即后台 sort_order */
  series: CatalogSeries[];
  locale?: "en" | "zh";
  /** 系列还没有详情页时退到询价页，不制造死链 */
  contactHref: string;
}) {
  if (series.length === 0) return null;

  const prefix = locale === "zh" ? "/zh" : "";

  return (
    <div className="product-tiles">
      {series.map((s) => {
        const icon = s.iconUrl?.trim() || tileIconOf(s.slug);
        return (
          <Link
            className="product-tile"
            href={hasSeries(s.slug) ? `${prefix}/products/${s.slug}` : contactHref}
            key={s.slug}
          >
            <span className="product-tile-figure">
              {icon ? (
                // 图标为构图固定的线描图，走原生 img 即可
                <img src={icon} alt="" loading="lazy" width={280} height={150} />
              ) : (
                <span className="product-tile-empty" aria-hidden />
              )}
            </span>
            <span className="product-tile-name">{pick(s.name, locale)}</span>
          </Link>
        );
      })}
    </div>
  );
}
