/**
 * 首页英雄区插画：直接搬用设计稿原码的 DOM 结构。
 *
 * 原样保留原稿的类名与层级（.visual > .ring + .filter + .filter.small），
 * 样式在 src/styles/demo-art.css 中逐字搬运原稿规则——端盖是伪元素椭圆、
 * 褶皱是 90 度重复渐变、投影是盒阴影，参数与原稿完全一致。
 * 这里不做任何二次创作，要调先改原稿。
 */
export default function HeroVisual() {
  return (
    <div className="visual" aria-label="Illustrative filter cartridges">
      <div className="ring" />
      <div className="filter" />
      <div className="filter small" />
    </div>
  );
}