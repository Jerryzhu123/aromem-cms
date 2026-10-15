# QA report — three rounds of checks and fixes

Each round below lists what was checked, what was found, and what changed.
Every fix was re-verified after it landed.

---

## Round 1 — Page completeness & routing

**Checked:** every URL discovered by the crawl, both URL shapes the source uses
(`/products?id=5.html` and `/products.html?id=5`), the clean clone routes, and a
production build.

### 1.1 Dynamic detail pages all returned 404 — `NaN` id

`src/lib/params.ts` read the id with `raw.match(/\d+/)[1]`. That regex has **no
capture group**, so index `1` is always `undefined` and `Number(undefined)` is
`NaN`. Every `/products`, `/projects`, `/news_detail` request fell through to
`notFound()`.

- **Fix:** use `match[0]`.
- **Verified:** `/products?id=5`, `/projects?id=1`, `/news_detail?id=49`,
  `/en/products?id=3` … all 200.

### 1.2 `/products`, `/projects`, `/news_detail` returned 500

The first asset-download pass treated extension-less links (`/products`,
`/projects`, `/news_detail`, `/en_*`) as files and wrote them into `public/`.
Next.js then reported *"A conflicting public file and page file was found for
path /products"* and every dynamic route 500'd.

- **Fix:** deleted the six bogus files and hardened the downloader to skip
  extension-less page routes.
- **Verified:** the "conflicting public file" error is gone; dynamic routes 200.

### 1.3 Source URLs with `.html` in the path but a query 404'd

The rewrite list only had the `/x.html` form. The source also links
`/en_products.html?id=6` and `/en_news_list.html?p=2`, which matched nothing.

- **Fix:** `next.config.ts` now derives the extension-less twin of every alias
  (`/en_products.html` → `/en_products`) and drops any self-rewrite.
- **Verified:** all 130 crawled URLs are replayed against the clone.

### 1.4 `npm start` could not serve the production build

The template shipped with `output: "standalone"`, and `next start` refuses to run
with it.

- **Fix:** removed `output: "standalone"`; `npm run build && npm start` works.
- **Verified:** `npm run check` (lint + typecheck + build) exits 0 and the
  production server serves all routes.

**Round 1 result:** 122/122 valid source URLs return 200; the 8 hrefs that 404 on
the source itself resolve to the closest real page instead of dead-ending.

---

## Round 2 — Styles & interactions

**Checked:** the header dropdowns, the home-page carousel / product filter /
video overlay, the breadcrumb, the page banners, and every CSS dependency.

### 2.1 Clicking a nav dropdown navigated away instead of opening the menu

The dropdown parents were Next.js `<Link>`s, so the click both toggled the menu
and pushed a route — the page navigated to `/products?id=22` and the menu was
lost. The source's Bootstrap dropdown swallows that click, so the parent must not
navigate.

- **Fix:** dropdown parents are plain `<a>` with `preventDefault()`; only the
  items inside the menu navigate.
- **Verified:** clicking 产品中心 opens the menu, URL stays `/`, two items listed.

### 2.2 Page-banner backgrounds and icon fonts were missing

The asset scan only looked at `src`/`href` in HTML. Every asset referenced from
*inside* the CSS — the FontAwesome webfonts and the `mu-page-header-*` background
images (`about-us_bg.jpg`, `news_bg.jpg`, `project_bg.png`, `product_bg1.jpg`,
`joinus_1.jpg`, …) — was never fetched, so inner pages had no banner and the
carousel arrows had no glyphs.

- **Fix:** added a CSS `url()` scan; 18 files downloaded.
- **Verified:** `/about1.html` renders its blue banner; slick arrows show.

### 2.3 React rejected the source's `align` attributes

`<li align="center">` and `<img align="right">` are not in React's typings.

- **Fix:** equivalent styles (`textAlign: "center"`, `float: "right"`).
- **Verified:** typecheck clean; the news carousel and footer QR still lay out
  identically.

**Round 2 result:** all three home-page interactions work — carousel autoplay
(3 s, pauses on hover like slick's `pauseOnHover`), filter (全部 9 / 家用 3 /
工业 6 items), lightbox, video overlay, dropdowns, and mobile hamburger.

---

## Round 3 — Runtime, mobile & assets

**Checked:** hydration under `npm run dev` and `npm start`, mobile rendering,
every referenced asset, and the lint/type gate.

### 3.1 `npm run dev` rendered a dead page — nothing hydrated

The page looked correct but was completely inert: the carousel never advanced,
the filter and dropdowns did nothing. Screenshot-level verification showed React
never attached (`useEffect` never ran), with **no console error at all**.

Root cause, from the dev server log:

```
⚠ Blocked cross-origin request to Next.js dev resource /_next/hmr from "127.0.0.1".
```

Next.js 16 treats `127.0.0.1` as a different origin from the `localhost` it
advertises, blocks the dev-only HMR resource, and the client bootstrap stops
without hydrating. Production has no HMR resource, which is why `npm start`
always worked — and why the bug was invisible unless you opened the dev server on
the loopback IP.

- **Fix:** `allowedDevOrigins: ["127.0.0.1", "localhost"]` in `next.config.ts`.
- **Verified:** dev now hydrates (dev indicator appears, `useEffect` runs,
  clicks change state) and the carousel advances.

### 3.2 ESLint scanned the vendored original site JS

881 problems — 155 errors — almost all from `public/static/index/js/jquery*.js`,
`slick.min.js`, `bootstrap.min.js`, `filterzero`, `magnific-popup`. That is the
source site's own code, served verbatim.

- **Fix:** `public/**` added to `globalIgnores`.
- **Verified:** lint clean.

### 3.3 `setState` inside an effect (real lint error in our code)

`SiteHeader` closed its menus with `useEffect(..., [pathname])`. It worked, but
it is exactly the pattern `react-hooks/set-state-in-effect` flags.

- **Fix:** menus now close from the link `onClick` handlers instead.
- **Verified:** dropdowns still close on navigation and on outside click.

### 3.4 Assets & mobile

- **Assets:** 110 unique assets referenced across 27 representative pages were
  fetched; **1 fails** — `/static/index/images/en_product_10_2.jpg`, which is
  **404 on aromem.com itself** (a pre-existing broken image). The clone keeps it
  as-is rather than inventing a replacement.
- **Mobile (390 px):** the header collapses to a hamburger, the hero scales, the
  product grid stacks to one column and the news carousel shrinks to the
  viewport. The single-column product grid is the *source's own* behaviour —
  its markup uses `col-xs-6`, which has no effect in Bootstrap 4.

**Round 3 result:** `npm run check` exits 0; 122/122 source URLs and 26/26
canonical routes return 200; 109/110 assets load (the exception is broken
upstream); dev and production are both interactive.

---

## Round 4 — 产品中心 grid layout (reported after delivery)

**Reported:** on desktop the 产品中心 tiles stacked in a single column; phones
looked right; the source site shows 3 columns × n rows.

**Root cause.** The source does not use a CSS grid for this section at all — it
uses **filterizr**, which measures every tile, computes a grid and writes the
result back as inline `position: absolute` + explicit widths. Two consequences:

- `style.css` has **no rules for `.filtr-container`**, because filterizr did not
  need a layout context.
- The tiles' Bootstrap `col-xs-6 col-sm-6 col-md-4` classes never laid anything
  out: there was no flex/grid parent, so `flex: 0 0 33.33%` had nothing to
  resolve against. `col-xs-*` is also dead in Bootstrap 4.

The clone reimplements the filtering in React and does not ship filterizr, so
the tiles fell back to `display: block; width: 100%` — and measured exactly that:
tiles 380px wide in a 1140px container (the `max-width` half of `col-md-4` still
applied) but with three different `top` values, i.e. one per row.

**Fix.** Lay the grid out with **CSS Grid** and drop the Bootstrap layout classes
from the markup:

```css
.filtr-container { display: grid; grid-template-columns: 1fr; }
@media (min-width: 576px) { .filtr-container { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 768px) { .filtr-container { grid-template-columns: repeat(3, 1fr); } }
.filtr-container .filtr-item { position: relative; min-width: 0; }
```

- `ProductFilterGrid.tsx`: `class="col-xs-6 col-sm-6 col-md-4 filtr-item"` →
  `class="filtr-item"`. Those classes only added `width: 100%` and 15px gutters
  that fought the grid.
- `position: relative` is now declared explicitly, since Bootstrap's `col-*` base
  rule used to supply it and `.mu-filter-item-content` needs it as its
  containing block.
- `min-width: 0` guards against the standard grid-item overflow (grid items
  default to `min-width: auto`).
- Column counts are pinned per breakpoint rather than using
  `repeat(auto-fit, minmax(...))`: auto-fit derives its own column count from the
  container width and would drift from the source's fixed 3-column layout.
- Grid `gap` stays 0 because spacing comes from the tiles' own `padding: 16px`
  (style.css). That reproduces the source's 32px gutter / 16px outer margin and
  keeps the hover overlay flush with the image.

**Verified** (measured in the browser):

| Viewport | `grid-template-columns` | Tiles per row | Rows |
| --- | --- | --- | --- |
| 1440px | `380px 380px 380px` | 3 | 3 |
| 768px | `240px 240px 240px` | 3 | 3 |
| 600px | `270px 270px` | 2 | 5 |
| 390px | `390px` | 1 | 9 |

At 1440px a tile is 380px in a 1140px container — identical to the source
(1140 / 3). Filtering to 工业产品系列 re-flows to 6 tiles in 3 columns × 2 rows.
`npm run check` still exits 0.

---

## Round 5 — Responsive sweep: mobile / tablet / desktop (3 cycles)

**Method.** A scripted sweep loads 7 representative pages at 390 / 768 / 1440 px
and reports, per page: elements sticking out past the viewport, images rendered
out of proportion, text clipped by an `overflow: hidden` box, touch targets below
the 24 px minimum, and broken images. Every cycle ended with a full rebuild
(`npm run check`) and a re-run of the sweep.

Scripts: `_recon/qa/sweep.sh` + `probe.js` / `probe2.js`.

### Cycle 1 — findings and fixes

| # | Finding | Fix |
| --- | --- | --- |
| 1.1 | **News carousel images were squashed on phones.** The source forces a 450×300 (3:2) box on every slide via `width`/`height` attributes. `style.css` only has `img { max-width: 100% }`, so scaling the width to 345 px left the height at 300 → ratio **1.15** instead of 1.50. | Added `#show-area1 img { width: 100%; aspect-ratio: 3 / 2 }`. |
| 1.2 | **70 px dead band under the caption on phones.** The container was pinned at 360 px while the scaled content was only 290 px. | Height is now derived from the measured width: `width × 2/3 + 60`. 450 → **360** (the source's own number, desktop unchanged), 345 → **290**. |
| 1.3 | **Carousel dots sat in the wrong place once the box shrank.** `mystyle.css` pins them at `top: 270px` — 30 px above the source's 300 px-tall image. | Dot offset derived from the scaled image height (`width × 2/3 − 30`), so 450 → **270** (unchanged) and 345 → 200, still on the image. |
| 1.4 | **The video overlay shipped a fixed 800 px `<video>`**, overflowing any phone once opened. | `.mu-video-iframe-area video { width: 100%; max-width: 800px; height: auto }`. |

Verified after cycle 1:

| vw | image | ratio | box | content | gap | dots |
| --- | --- | --- | --- | --- | --- | --- |
| 390 | 345×230 | 1.50 | 290 | 290 | **0** | on image |
| 768 | 315×210 | 1.50 | 270 | 270 | **0** | on image |
| 1440 | 450×300 | 1.50 | 360 | 330 | 30 | 270 (source value) |

### Cycle 2 — findings and fixes

| # | Finding | Fix |
| --- | --- | --- |
| 2.1 | **工程实例 card images changed shape on desktop.** `height: auto` (added in cycle 1) made them follow their *natural* ratio (350×233) instead of the source's forced 350×200 box. | Pinned the box: `.mu-single-service-content img { width: 100%; max-width: 350px; aspect-ratio: 350 / 200 }`. Desktop is back to exactly **350×200**; a phone gets **252×144** — the same framing, scaled. |

Also audited but **not** changed, because they turned out to be the source's own
behaviour rather than defects:

- The 工程实例 card content is 70 % wide below 992 px — that is the source's own
  `@media (max-width: 991px) { .mu-single-service-content { width: 70% } }`.
- The 招聘简章 table carries `width="900"` and the spec tables 657–709 px. The
  existing `.cloned-content table { max-width: 100% }` already makes them reflow
  and wrap inside a 360 px column — the source instead clips them.
- The news images marked `height="50%"` are percentages, which browsers ignore —
  so only 21 images in the whole site carry a real pixel height (20 project cards
  + 1 logo), which is why the `height: auto` fix had almost no desktop fallout.

### Cycle 3 — findings and fixes

| # | Finding | Fix |
| --- | --- | --- |
| 3.1 | **`.mu-imglink` had a 20 px-tall box while the image inside it was 259 px tall.** It is inline in the source and wraps a block-level overlay, so the inline box fragments and its bounding box collapses to one line. Clicks still worked (the lightbox opened), but the link's box did not cover its content. | `.mu-imglink { display: block }`. Tile height is unchanged (390×291 at 390 px; 380×283 at 1440 px). |
| 3.2 | **Text links were ~19 px tall on phones**, below the 24 px touch minimum (WCAG 2.5.8) — the footer columns and the breadcrumb. | On ≤767 px the hit area is extended with an `::after` inset −5 px (19 → **29 px** effective). Nothing visual changes, and the ±5 px stays inside the existing 30 px list spacing so links never overlap. |

### Final state (after all three cycles)

| Check | Result |
| --- | --- |
| Horizontal overflow (7 pages × 3 viewports) | **0** |
| Images rendered out of proportion | **0** |
| Text clipped by an `overflow: hidden` box | **0** |
| Broken images | **0** |
| Touch targets below 24 px on phones | fixed for the footer and breadcrumb text links (19 → 29 px) |
| `npm run check` (lint + typecheck + build) | **exit 0, no warnings** |
| Source URL coverage | **122 / 122 → 200** |
| Asset load | 110 checked, 1 fails (404 on the source too) |

### Note on the remaining "small target" flags

The audit still flags a number of bare `<a>` elements at ~19 px tall. These are
**measurement artifacts, not defects**: they are inline links wrapping block
content (an image, or an `<h3>` + `<p>` + `<img>`), so the inline box fragments
and `getBoundingClientRect()` collapses to a single line. The content inside them
is fully tappable — measured on the phone:

| Link | Link box | Content inside it | Tappable area |
| --- | --- | --- | --- |
| News carousel slide | 345×19 | image 345×230 | the whole image |
| About card image | 360×20 | image 360×214 | the whole image |
| Project card | 252×154 | image 252×144 + heading + blurb | the whole card |
| Product tile | 358×259 | image 358×259 | the whole tile (`.mu-imglink` is now block) |

A real tap-target problem only existed for the pure text links (footer columns,
breadcrumb), which is what cycle 3 fixed.

---

## Known limitations

1. `/static/index/images/en_product_10_2.jpg` is broken on the source site too.
2. The eight hrefs that 404 upstream (`/download.html`, `/product1_1.html`, …)
   are redirected to the closest real page rather than reproduced as 404s, so no
   link in the clone dead-ends.
3. Google Fonts (Raleway / Open Sans) are still loaded from the original URLs.
   They are blocked on the Chinese network — exactly as they are for the source
   site — and the template degrades gracefully because it barely uses them.
4. CMS bodies are reproduced verbatim, including their per-page `<style>` blocks.
   Those styles are scoped to the page's lifetime because React removes the
   subtree (and the `<style>` element) on navigation.
