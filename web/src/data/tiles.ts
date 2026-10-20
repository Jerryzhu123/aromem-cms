/**
 * 产品分类格子的本地默认图标。
 *
 * 定位：静态导出的兜底。产品中心页的格子优先用后台 fc-series 的 icon_url
 * （后台上传，存媒体库 /media/...）；后台没有数据或某条没配图标时，
 * 才按系列 slug 回落到这里预置的本地文件。
 *
 * 换图标的两条路：
 * - 只改兜底 → 替换 public/products/ 下同名文件，重新构建；
 * - 正式换 → ADP「滤芯系列」里上传，即时生效，无需构建。
 */

/** 系列 slug → 本地图标路径 */
export const TILE_ICONS: Record<string, string> = {
  // 微孔折叠滤芯（darlly S-Micro.jpg）
  pleated: "/products/tile-pleated.png",
  "high-flow": "/products/tile-high-flow.png",
  // 多折滤芯（darlly S-Pleated.jpg）——与微孔折叠是两个品类，图也不一样
  multifold: "/products/tile-multifold.png",
  // 泳池滤芯（darlly S-pool.jpg）
  pool: "/products/tile-pool.png",
  // 以下两个已不在品类导航里（后台置为 OFFLINE），保留图标以备恢复
  depth: "/products/tile-depth.png",
  specialty: "/products/tile-metal.png",
  "ro-membranes": "/products/tile-ro.png",
};

/** 取某个系列的本地兜底图标；没有则返回空串（格子渲染成占位块） */
export function tileIconOf(slug: string): string {
  return TILE_ICONS[slug] ?? "";
}
