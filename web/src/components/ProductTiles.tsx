"use client";

/* eslint-disable @next/next/no-img-element */

/**
 * 产品分类格子（产品中心页）。
 *
 * 版式对齐同行常见的「一格一品类」产品导航：每格一张线描图标 + 一个名称，
 * 整格可点。取数策略与 FilterSeriesGrid 一致——fetch-with-fallback：
 * - 首屏用传入的内置格子（静态导出直接进 HTML，保 SEO，也防后台空表白屏）；
 * - 水合后拉 GET /api/v1/fc-series，拉到非空则整组覆盖，因此在 ADP 里
 *   增删分类、改名、换图标、调顺序，刷新页面即时生效，不必重新构建；
 * - 拉取失败静默回退，不弹错、不打断渲染。
 *
 * 图标取值优先级：后台 icon_url（媒体库 /media/...）> 本地兜底 tiles.ts > 占位块。
 *
 * 注意：这里只管「分类列表」的展示。分类详情页是静态导出路由，
 * 新增分类若要有自己的详情页，仍需重新构建才能生成（详见 README）。
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSeries, hasSeries } from "@/data/catalog";
import { tileIconOf } from "@/data/tiles";
import { fetchFilterSeries, type FilterSeries } from "@/lib/content";

/** 内置兜底格子的形状 */
export interface TileFallback {
  /** 系列 slug，用于匹配本地兜底图标 */
  slug: string;
  name: string;
  href: string;
}

interface TileView {
  key: string;
  name: string;
  icon: string;
  href: string;
}

/**
 * 判断某个分类属于哪条产品线。
 * 本地系列知识库里有 kind（filter / ro）；后台新加、本地还不认识的 slug
 * 默认归到滤芯线——那是主产品线，放错也只是多一格，不会被藏起来。
 */
function lineOf(slug: string): "filter" | "ro" {
  return getSeries(slug)?.kind ?? "filter";
}

export default function ProductTiles({
  fallback,
  locale = "en",
  contactHref,
  line,
}: {
  fallback: TileFallback[];
  locale?: "en" | "zh";
  contactHref: string;
  /** 只渲染属于这条产品线的分类（后台接口返回的是全量清单） */
  line: "filter" | "ro";
}) {
  const [series, setSeries] = useState<FilterSeries[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetchFilterSeries(locale).then((list) => {
      if (alive && list) setSeries(list);
    });
    return () => {
      alive = false;
    };
  }, [locale]);

  const prefix = locale === "zh" ? "/zh" : "";

  // 后台返回全量分类，必须按产品线切分，否则两条产品线会各渲染一遍全量
  const scoped = series?.filter((s) => lineOf(s.slug) === line) ?? [];

  const tiles: TileView[] =
    scoped.length > 0
      ? scoped.map((s) => ({
          key: `db-${s.slug}`,
          name: (locale === "zh" ? s.nameZh : s.nameEn).trim(),
          // 后台配了图标优先用后台的，没配则按 slug 回落本地兜底
          icon: s.iconUrl?.trim() || tileIconOf(s.slug),
          // 能对上本地系列页才进详情，否则退到询价页，不制造死链
          href: hasSeries(s.slug)
            ? `${prefix}/products/${s.slug}`
            : contactHref,
        }))
      : fallback.map((t, index) => ({
          key: `static-${index}`,
          name: t.name,
          icon: tileIconOf(t.slug),
          href: t.href,
        }));

  return (
    <div className="product-tiles">
      {tiles.map((tile) => (
        <Link className="product-tile" href={tile.href} key={tile.key}>
          <span className="product-tile-figure">
            {tile.icon ? (
              // 图标为构图固定的线描图，静态导出下走原生 img 即可
              <img src={tile.icon} alt="" loading="lazy" width={280} height={150} />
            ) : (
              <span className="product-tile-empty" aria-hidden />
            )}
          </span>
          <span className="product-tile-name">{tile.name}</span>
        </Link>
      ))}
    </div>
  );
}
