# AGENTS.md — web（SURMEM 官网英文站）

B2B 询盘导向的六栅目站，Next.js 16 App Router。构建期全量预渲染 + 运行时按需再生成。

包管理器 **pnpm@9**，Node 20。`pnpm-lock.yaml` 是 CI `--frozen-lockfile` 的依据，不能删也不能改而不同步。

## 命令

| 命令 | 作用 |
|---|---|
| `pnpm dev` | 开发，:3000 |
| `pnpm build` | 生产构建（standalone 形态） |
| `pnpm typecheck` | tsc --noEmit |
| `pnpm check:pool-api` | 拉泳池产品数据（`scripts/fetch-products.mjs`） |

## 构建形态（必须先知道）

从 2026-10-21 起，前台不是静态导出，而是 **standalone 运行目录**（`server.js` + `.next` + `public`）。页面仍在构建期全部预渲染，但缓存可被后台吊销，改数据不必重新走一遍构建部署。

`build-web.yml` 会硬校验以下几项，不满足直接失败：

- `.next/standalone/server.js` 必须存在（否则是 `next.config` 的 `output` 没配对）
- `.next/static` 必须存在，否则静态资源全部不加载
- `public` 必须存在，否则图片全部 404
- 预渲染页面数 **≥1000**（正常在 1160 上下），低于此值判为构建异常

## 硬约束（Do NOT）

- **不要想回去用 `output: 'export'`** —— 构建形态和部署链路已整体改成 standalone
- **不要把 `public/products/pool` 提交进仓库** —— 体积大且内容稳定，构建时主动剔除，部署时由服务器从在用目录硬链接继承
- **不要在构建期依赖服务器内网** —— 构建机连不到，取数必须走公网域名，目前是 `https://www.surmem.com`
- **不要手动拼部署包** —— 产物超过 GitHub 单文件 100MB 上限，工作流按 90MB 分卷，部署时用 `cat` 拼回

## 技术栈

Next.js 16.3.5 ・ React 19.2.4 ・ antd 6.6.6（用 `@ant-design/nextjs-registry` 做 SSR 样式注入）・ TypeScript 5 ・ Tailwind 没装，样式靠 CSS Modules

## 待确认（2026-11 初的实测状态，可能已变）

- 首页 `<title>` 仍是 `AROMEM PTE. LTD. (SURO)`
- 全站未上 HTTPS
- `/api/v1/products` 返回 404
