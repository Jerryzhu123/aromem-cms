# 苏州苏瑞膜纳米科技集团官网 — React / Next.js 克隆

对 **https://aromem.com**（苏州苏瑞膜纳米科技集团有限公司官网）的完整复刻，
使用 [ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template)
的克隆流程逆向还原为组件化、路由化的 React（Next.js App Router）项目。

- **原站**：https://aromem.com （中英双语企业站，PHP + Bootstrap 4 + jQuery 模板）
- **克隆范围**：全站 **100 个唯一页面 / 122 个有效 URL**，含 36 篇中文新闻详情、
  12 个产品页、5 个工程实例、13 篇英文新闻、7 个英文产品页，以及关于我们、
  加入我们、产品手册等静态页；导航下拉、页脚栏目中的每个入口均已覆盖。

## 启动方式

```bash
# 1. 安装依赖（需要 Node.js >= 24）
npm install

# 2. 开发模式（默认 http://localhost:3000）
npm run dev

# 3. 生产构建 + 启动
npm run build
npm start
```

其他脚本：

```bash
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run check      # lint + typecheck + build
```

> 本机若同时存在多个 Node 版本，请确保使用 **24+**（`node -v` 确认）。

> **关于 `npm run dev`**：`next.config.ts` 里配置了
> `allowedDevOrigins: ["127.0.0.1", "localhost"]`。
> Next.js 16 默认会把「非它自己宣告的 host」对 dev 专用资源 `/_next/hmr` 的请求
> 判为跨域并拦截；一旦被拦截，dev 客户端引导会**静默中断**——页面样式正常但完全不响应点击，
> 且控制台没有任何报错。加上这个配置后，用 `localhost` 或 `127.0.0.1` 访问都能正常交互。

## 路由

克隆保留了原站的**每一个 URL**：`.html` 结尾的地址、以及 `?id=` 在扩展名前后两种写法
（`/products?id=5.html` 与 `/products.html?id=5`）都通过 `next.config.ts` 的 rewrites
映射到干净的 App Router 路径，因此原站上的任何链接都不会 404。

| 原站 URL | 克隆路由 |
| --- | --- |
| `/`、`/indexs.html`、`/index.html` | `/` |
| `/about1..4.html` | `/about1` … `/about4` |
| `/news_list.html`、`/news_list.html?p=2..4` | `/news_list?p=` |
| `/news_detail?id=49.html`、`/news_detail.html?id=49` | `/news_detail?id=49` |
| `/products?id=5.html`、`/products.html?id=5` | `/products?id=5` |
| `/projects?id=1.html` | `/projects?id=1` |
| `/join.html`、`/handbook.html` | `/join`、`/handbook` |
| `/en_indexs.html` | `/en` |
| `/en_about1..3.html`、`/en_join.html` | `/en/about1..3`、`/en/join` |
| `/en_news_list.html`、`/en_news_detail?id=31.html` | `/en/news_list`、`/en/news_detail?id=31` |
| `/en_products?id=3.html`、`/en_projects?id=1.html` | `/en/products?id=3`、`/en/projects?id=1` |

完整清单见 [`docs/research/aromem/SITE_MAP.md`](docs/research/aromem/SITE_MAP.md)。

## 目录结构

```
src/
  app/                        # 路由（每个原站页面一个路由）
    page.tsx                  # 首页
    about1..4/ news_list/ news_detail/ products/ projects/ join/ handbook/
    en/                       # 英文站（首页 + 各子页）
  components/
    site/                     # 共享外壳
      SiteHeader.tsx          # 顶部导航（下拉 + 移动端折叠）
      SiteFooter.tsx          # 页脚四栏 + 版权
      PageBanner.tsx          # 内页页头 banner（按 id 后缀切换背景图）
      Breadcrumb.tsx          # 面包屑
      RichContent.tsx         # CMS 富文本正文渲染
      ClonedPage.tsx          # 内页统一外壳：header → banner → 面包屑 → 正文 → footer
    home/                     # 首页分区块组件
      HomeSlider.tsx          # 首屏轮播（还原 slick 的 DOM 与行为）
      ProductFilterGrid.tsx   # 产品中心筛选 + 图片灯箱（布局用 CSS Grid，见 globals.css）
      VideoSection.tsx        # 视频弹层
      NewsCarousel.tsx        # 新闻图片轮播
      NewsSection.tsx / ProjectsSection.tsx / AboutSection.tsx
  hooks/
    useInfiniteCarousel.ts    # 无限轮播状态机（首页轮播与新闻轮播共用）
  data/
    pages.json                # 100 个页面的正文/面包屑/banner（抽取产物）
    pages.ts                  # 类型化访问器
    home.ts                   # 首页结构化数据（中英）
    nav.ts                    # 导航与页脚配置（中英）
  types/                      # 类型定义
  lib/params.ts               # searchParams 解析
public/
  static/index/               # 原站 CSS / JS / 图片 / 字体 / 视频（原样保留）
  uploads/ ueditor/           # 原站 CMS 上传的图片
  favicon.png  *.pdf          # 站点图标与产品手册 PDF
docs/research/aromem/
  SITE_MAP.md                 # 站点地图与路由映射
  PAGE_TOPOLOGY.md            # 页面结构
  BEHAVIORS.md                # 交互行为清单
  QA_REPORT.md                # 三轮检查与修复记录
docs/design-references/aromem/  # 桌面端 / 移动端 / 内页验证截图
```

## 验证结果

| 检查项 | 结果 |
| --- | --- |
| `npm run check`（lint + typecheck + build） | ✅ 通过，23 条路由 |
| 源站 URL 覆盖（含 `.html`、`?id=` 两种写法） | ✅ 122 / 122 返回 200，0 缺失 |
| 克隆自有路由 | ✅ 26 / 26 返回 200 |
| 静态资源加载 | ✅ 110 项中 109 项正常；唯一失败项在原站即为 404 |
| 首页交互（轮播自动播放 / 产品筛选 / 图片灯箱 / 视频弹层 / 导航下拉） | ✅ 均正常 |
| 移动端（390px） | ✅ 导航折叠为汉堡菜单、栅格单列，与原站响应式行为一致 |
| dev / 生产模式注水 | ✅ 均可交互 |

完整过程见 [`docs/research/aromem/QA_REPORT.md`](docs/research/aromem/QA_REPORT.md)。

## 实现说明

- **样式**：直接复用原站样式表（Bootstrap 4 + `style.css` / `mystyle.css` /
  `slick.css` / `magnific-popup.css` / FontAwesome），在 `layout.tsx` 中按原站顺序
  以 `<link>` 引入。刻意**不引入 Tailwind**——它的 preflight 会重置 Bootstrap 基础样式，
  破坏 1:1 还原。
- **交互**：原站的 jQuery / slick / filterizr / magnific-popup 行为全部用 React 重写
  （见 `BEHAVIORS.md`），但**保留原有 class 名**，因此原样式表继续生效。
- **首页「产品中心」布局用 CSS Grid**：原站这一块是 filterizr 用绝对定位算出来的
  （所以 `style.css` 里 `.filtr-container` 没有任何规则，`col-md-4` 也从未真正生效）。
  克隆改用 `display: grid`，列数在断点上固定：<576px 1 列、≥576px 2 列、≥768px 3 列。
  间距仍由每个卡片的 `padding: 16px` 提供（`gap: 0`），与原站 32px 间隙 / 16px 外边距一致。
- **正文**：CMS 富文本正文（含内联样式、表格、图片）按原文渲染，仅重写站内链接，
  保证文案、表格与排版与原站一致。
- **响应式**：原站样式表本身只做到「不溢出」（`img { max-width: 100% }` 缺 `height: auto`、
  轮播容器/指示点是写死的 360px / 270px）。克隆补上了这些缺口，且**桌面端渲染与原站完全一致**：
  轮播图锁定原站 3:2 框并按宽度等比缩放、工程实例图锁定 350:200 框、视频弹层不再固定 800px、
  移动端页脚与面包屑链接的点击区扩到 29px（视觉不变）。详见
  [`docs/research/aromem/QA_REPORT.md`](docs/research/aromem/QA_REPORT.md) 的 Round 5。
- **已知原站缺陷**：`/static/index/images/en_product_10_2.jpg` 在**原站本身就是 404**，
  克隆保持原样；`/download.html`、`/product1_1.html` 等 8 个链接在原站即 404，
  克隆将其重定向到最接近的真实页面，避免死链。

## 许可与用途

原站的 Logo、品牌素材与文案版权归苏州苏瑞膜纳米科技集团有限公司所有。
本项目仅用于技术演示与学习（逆向还原流程验证），不得用于冒充、欺骗或任何违法用途。
