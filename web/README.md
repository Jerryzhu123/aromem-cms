# SURMEM 英文站（surmem-web）

B2B 询盘导向的六栏目官网，**构建时静态生成**（方案 A），服务器上只需 Nginx 托管静态文件，不再跑 Node 进程。

- 技术栈：Next.js 16 + React 19 + antd 6 + axios
- 栏目：Home / About Us / Products / OEM & Private Label / Applications / Contact Us
- 设计：客户概念稿的设计令牌（藏青 `#102b43`、品牌蓝 `#126c9c`、薄荷绿 `#1a9c91`）

## 本地开发

```bash
npm install        # 安装依赖
npm run dev        # 开发服务器 http://localhost:3000
npm run build      # 静态导出，产物在 out/
npm run typecheck  # 类型检查
```

## 环境变量（复制 .env.example 后按需修改，凭据绝不写死）

| 变量 | 作用 | 默认 |
|---|---|---|
| `NEXT_PUBLIC_API_BASE` | 浏览器端接口前缀（询盘表单）。生产环境留空走相对路径（Nginx 代理 /api/v1 → 后端 8080，同源） | 空 |
| `CMS_API_BASE` | 构建时拉取后台数据的地址（当前一期页面全部为内置文案，未使用；预留） | 空 |

## 目录结构

```
src/
  app/                  # 六个栏目页 + 404
    products/           # /products
      [series]/         #   系列页 /products/high-flow …
        [model]/        #   型号详情 /products/high-flow/mhf …
    zh/                 # 中文镜像（同样的 series / model 层级）
  components/           # Providers / SiteHeader / SiteFooter / QuoteForm
    products/           # SeriesView（系列页视图）/ ProductView（型号详情视图）
  data/site.ts          # 全站文案与栏目数据（改文案只动这里）
  data/site-zh.ts       # 中文文案
  data/catalog.ts       # 产品系列与 25 个型号（双语，静态导出的数据源）
  lib/request.ts        # axios 二次封装（拦截器 / 统一响应体 / 中文错误提示）
  lib/content.ts        # 后台内容接口（fc-series / site/bootstrap）+ 回退
  styles/               # 设计令牌 + 页头样式
docs/                   # 客户概念稿留档
```

## 增加产品数据（重要）

本站是 `output: "export"` 纯静态导出，**型号页面的路由在构建期固定**，
后台新增数据不会自动长出页面。加型号的正确步骤：

1. 编辑 `src/data/catalog.ts`：
   - 新系列 → 加到 `CATALOG_SERIES`；
   - 新型号 → 加到 `CATALOG_PRODUCTS`（`seriesSlug` 必须是已有系列）；
2. `pnpm build`（会自动为每个型号生成英文页 + 中文页）；
3. 上传新的 `out/` 到服务器。

型号数据同时是页面正文的数据源：规格、技术复核说明、核实状态、询价清单
都从这里渲染，改参数只改 `catalog.ts` 一处即可。

后台 `fc-series` 与本地系列页的对应关系：后台系列的 `slug` 必须等于
`CATALOG_SERIES` 里的 `slug`（`high-flow` / `pleated` / `depth` /
`specialty` / `ro-membranes`），产品页的系列卡才会进系列页；对不上时
卡片退回询价页，不会产生 404。


## 部署（服务器 Nginx 托管）

1. `npm run build` → 产出 `out/`
2. 上传 `out/` 内容到服务器 `/opt/aromem/surmem-web/`
3. Nginx 关键配置（并入现有 aromem.conf 的主站 server 块）：

```nginx
    # 静态站根目录（替代原 Next.js 3000 反代）
    root /opt/aromem/surmem-web;
    index index.html;

    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    # 404 兜底页
    error_page 404 /404.html;

    # 接口与媒体继续反代到 Java 后端（保持原有配置）
    location /api/v1/ { proxy_pass http://127.0.0.1:8080/api/v1/; proxy_set_header Host $host; client_max_body_size 50m; }
    location /media/   { proxy_pass http://127.0.0.1:8080/media/; }
    location /static/  { proxy_pass http://127.0.0.1:8080/static/; }
```

4. 服务器上的 `aromem-cloner`（Node 常驻服务）停用并取消开机自启，释放内存：

```bash
systemctl disable --now aromem-cloner
```

## 内容更新流程

页面文案集中在 `src/data/site.ts`，修改后重新构建并上传 `out/` 即生效。
二期若要「后台发布 → 前台自动更新」，在构建机上加一条定时/钩子构建即可。

## 待办（上线前）

- [ ] 客户核实正式联系方式（邮箱/电话/地址/WhatsApp），回填 `src/data/site.ts` 的 CONTACT 与页脚
- [ ] 产品目录核实后，把真实型号、参数、图片替换 Products 页占位卡片
- [ ] 表单防垃圾：后端 /api/v1/rfq 加频率限制或人机校验
- [ ] 中文站：沿用现有旧站（/zh 走原 cloner），二期再决定是否出新版中文
