# aromem.com — Interaction & behaviour inventory

Every behaviour below was observed on the live site and re-implemented in React.
The original is a Bootstrap 4 + jQuery template; the clone keeps the original
DOM class names so `style.css` / `slick.css` / `magnific-popup.css` still drive
the visuals.

## Global chrome

| Element | Behaviour | Original mechanism | Clone |
| --- | --- | --- | --- |
| Header nav dropdowns (产品中心 / 工程实例 / 下载中心 / 关于我们 / 语言) | Click the parent to open, click again or click outside to close. On < 992 px the whole nav collapses behind a hamburger. | Bootstrap 4 `data-toggle="dropdown"` + `collapse` | `SiteHeader` — `useState` for the open dropdown and the collapsed menu, plus a document click listener. Same `.dropdown-menu.show` / `.collapse.show` classes. |
| Sticky/scroll behaviour | None. The header scrolls away with the page. | — | — |

## Home page — `/`

| Section | Interaction model | Details |
| --- | --- | --- |
| `#mu-slider` hero | time-driven + click | slick carousel: `arrows: true, dots: false, infinite: true, speed: 500, autoplay: true, cssEase: 'linear'`. Infinite wrap is done with a clone of slide 1, exactly like slick. `HomeSlider` + `useInfiniteCarousel`. |
| `#mu-portfolio` product grid | click-driven | Filter on `data-filter` (`all` / `1` 家用产品系列 / `2` 工业产品系列) matching `data-category`, plus a magnific-popup image lightbox with gallery prev/next. **Layout:** the source uses filterizr (absolute positioning); the clone uses **CSS Grid** — 1 / 2 / 3 columns at <576 / ≥576 / ≥768px. `ProductFilterGrid` + the grid rules in `globals.css`. |
| `#mu-video` | click-driven | Clicking `.mu-video-play-btn` adds `mu-video-iframe-display` to `.mu-video-iframe-area`; clicking the overlay removes it. `VideoSection`. |
| `#mu-about` news carousel | time-driven + click/hover | Hand-written jQuery: 3000 ms autoplay, prev/next arrows that fade to `opacity: .5` on hover, dot indicators that jump on hover. `NewsCarousel`. |
| `#mu-service` projects | static | Five cards, no hover animation. |
| `#mu-from-blog` about cards | static | Link + image only. |

## Inner pages

| Page type | Interaction model | Details |
| --- | --- | --- |
| about1–4 / join / handbook / all English pages | static | Page banner + breadcrumb + CMS body. |
| `#mu-breadcrumb` | static | First crumb links home, last is `active`. |
| `#mu-banner` variants | static | `mu-page-header-{about,news,project,product,producten,producten2,product2,join}` — each id swaps a background image from `style.css`. |
| news list pagination | click-driven | `/news_list.html?p=1..4`, plus a "更多新闻资讯" archive list. |
| handbook download buttons | click-driven | `onclick="window.location.href='…pdf'"` — the two PDFs are shipped in `public/`. |
| product / project detail tables | static | CMS tables; per-page `<style>` blocks are preserved verbatim inside the page body. |

## Behaviours deliberately NOT reproduced

- **Google Fonts (Raleway / Open Sans).** The `<link>` tags are kept for parity, but they are blocked in mainland China, so the live site effectively renders with default fonts — the clone behaves the same.
- **`jQuery`, `slick`, `filterizr`, `magnific-popup` scripts.** Not loaded at all; their behaviour is reimplemented in React. Only their CSS is reused.

## Responsive behaviour

The source's stylesheets are reused verbatim, so its own breakpoints apply
unchanged (1199 / 992 / 991 / 767 / 640 / 480 / 360 / 320 px in `style.css`, plus
Bootstrap's 576 / 768 / 992 / 1200). The clone adds only corrections where the
source leaves a gap once things scale down — all of them keep the desktop
rendering identical. See `PAGE_TOPOLOGY.md` for the table and `QA_REPORT.md`
Round 5 for the measurements.

Verified across 7 pages × 3 viewports (390 / 768 / 1440): no horizontal overflow,
no out-of-proportion images, no clipped text, no broken images.
