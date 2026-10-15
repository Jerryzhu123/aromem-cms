# aromem.com — Page topology

The source site is a classic Chinese corporate template: one shared header and
footer, and a body that is either a hand-built landing page or CMS rich text.

## Shared shell (every page)

```
<header id="mu-hero">          logo + horizontal nav (collapses < 992px)
  └ .mu-navbar-nav             首页 · 产品中心▾ · 工程实例▾ · 新闻资讯 · 下载中心▾ · 关于我们▾ · 加入我们 · 语言▾

[optional] page banner          #mu-page-header-{about|news|project|product|producten|producten2|product2|join}
                                background-image comes from style.css; padding: 150px 0
[optional] #mu-breadcrumb       首页 / <section>

<main>                          page body (CMS rich HTML, inline styles, tables)
<footer id="mu-footer">
  ├ .mu-footer-top              4 columns: 苏瑞膜 · 产品中心 · 工程实例 · 联系方式(+QR)
  └ .mu-footer-bottom           copyright + ICP
```

## Home page section order

| # | Section id | Contents | Clone component |
| --- | --- | --- | --- |
| 1 | `#mu-slider` | 3 hero slides (desktop) / 2 (English) | `HomeSlider` |
| 2 | `#mu-portfolio` | 产品中心 title, 3 filters, 9 product tiles | `ProductFilterGrid` |
| 3 | `#mu-video` | play button + SURO-苏瑞膜 blurb + video overlay (**zh only**) | `VideoSection` |
| 4 | `#mu-about` | 新闻资讯: 5-slide image carousel + 3 headline links + CTA | `NewsSection` → `NewsCarousel` |
| 5 | `#mu-service` | 工程实例: 5 cards | `ProjectsSection` |
| 6 | `#mu-from-blog` | 关于我们: 3 blog cards | `AboutSection` |

## Page-body variants

| Variant | Pages | Banner | Body |
| --- | --- | --- | --- |
| About | `/about1`–`/about4` | `mu-page-header-about` | CMS text + images + honour galleries |
| News list | `/news_list` (+`?p=`) | `mu-page-header-news` | 3-card grid + archive list + pagination |
| News detail | `/news_detail?id=` | none | title + date + CMS article (often long, with images) |
| Product | `/products?id=` | `mu-page-header-product` | 3-column: sidebar product menu + rich spec tables |
| Project | `/projects?id=` | `mu-page-header-project` | title + intro + process image + spec table |
| Join | `/join` | `mu-page-header-join` | 公司概况 block + 招聘简章 table |
| Handbook | `/handbook` | `mu-page-header-about` | 2 PDF download rows |
| English mirror | `/en/*` | `-producten` / `-producten2` etc. | same as above, English copy |

## Responsive rules

- Bootstrap 4 grid elsewhere: `col-md-*` collapses to full width below 768px;
  `col-sm-*` below 576px.
- `@media (max-width: 767px)` blocks in `style.css` handle the mobile header,
  footer and section padding.

### 产品中心 grid — CSS Grid, not the source's filterizr

The source lays this grid out with **filterizr**, which measures every tile,
computes a grid and writes the result back as inline `position: absolute` +
explicit widths. That is why `style.css` contains no rules for
`.filtr-container`, and why the tiles' Bootstrap `col-xs-6 col-sm-6 col-md-4`
classes never actually laid anything out — there was no flex/grid parent to
resolve `flex: 0 0 33.33%` against.

The clone reimplements the filtering in React and does not ship filterizr, so
the layout is done with **CSS Grid** (declared in `src/app/globals.css`) and the
Bootstrap `col-*` classes have been removed from the tile markup.

| Viewport | Columns | Implementation |
| --- | --- | --- |
| < 576px | 1 | `grid-template-columns: 1fr` |
| ≥ 576px | 2 | `repeat(2, 1fr)` |
| ≥ 768px | 3 | `repeat(3, 1fr)` |

Column counts are pinned per breakpoint rather than derived from
`repeat(auto-fit, minmax(...))`: auto-fit picks its own column count from the
container width, which drifts away from the source's fixed 3-column desktop
layout. Tiles keep `padding: 16px` from `style.css` and the grid `gap` stays 0,
so the visual gutter between tiles is 32px and the outer margin 16px — exactly
as on the source — and the absolutely positioned hover overlay
(`.mu-filter-item-content`, inset 16px) stays flush with the image.

Measured: 1440px → 3 columns × 3 rows (380px tiles in a 1140px container, i.e.
the same 1140/3 as the source); 768px → 3 columns; 600px → 2 columns; 390px →
1 column. Filtering to 工业产品系列 re-flows to 6 tiles in 3 columns × 2 rows.

### Other clone-only responsive corrections

All of these keep the desktop rendering identical to the source; they only change
what happens once things scale down.

| Area | Source behaviour | Clone |
| --- | --- | --- |
| News carousel image | Forces a 450×300 box via `width`/`height` attributes, but only has `img { max-width: 100% }` — so scaling the width squashes the image to a different ratio (345×300 = 1.15). | `aspect-ratio: 3 / 2`, so the box ratio holds at every width (345×230). |
| News carousel height | Pinned at 360 px. | Derived from the measured width (`width × 2/3 + 60`): 450 → 360 (unchanged), 345 → 290, which removes the dead band under the caption. |
| News carousel dots | `top: 270px` — 30 px above the source's 300 px image. | Offset derived the same way (`width × 2/3 − 30`): 450 → 270 (unchanged), 345 → 200, still on the image. |
| 工程实例 card images | `width="350" height="200"` forces a 1.75 box on images whose natural ratio is 1.50. | Same 1.75 box pinned with `aspect-ratio`, so desktop is exactly 350×200 and a phone gets 252×144. |
| Video overlay | A fixed 800 px `<video>`, overflowing any phone once opened. | `width: 100%; max-width: 800px`. |
| CMS rich-text tables | Up to 900 px wide; the source clips them (body has `overflow-x: hidden`). | `max-width: 100%`, so they reflow and wrap inside a 360 px column. |
| Product tile link | `.mu-imglink` is inline and wraps a block overlay, so its box collapses to ~20 px. | `display: block` — the box covers the image; the rendered tile is unchanged. |
| Footer / breadcrumb links | ~19 px tall, below the 24 px touch minimum. | On ≤767 px the hit area is extended with an `::after` inset −5 px (19 → 29 px). Visually identical. |
