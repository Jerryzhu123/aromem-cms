# AGENTS.md — aromem-cms

这个文件是任何人（包括 AI）动代码前必须读完的唯一入口。子目录的 AGENTS.md 只在进入该子项目时读。

## 一句话与终极目的

AROMEM（SURMEM）B2B 站点与后台的单仓库多项目集合：一个仓库里同时装官网前台、后台管理、后台接口、网站克隆工具链。

终极目的不是"能跑起来"，是能稳定交付询盘，并且每一端都能独立构建、独立部署、独立回滚。所以四套工程体系共存是故意的，不是没收拾干净。

## 环境与命令

**四个子项目，三套包管理器。弄混了就是装不上。**

| 目录 | 是什么 | 包管理器 | Node | 开发 | 构建 |
|---|---|---|---|---|---|
| `ADP/` | 后台管理，Ant Design Pro 6 × Umi Max 4 × antd 6 | **pnpm@9** | CI 用 20（package.json 写 ≥22，以 CI 为准） | `pnpm start`（带 mock）/ `pnpm dev`（不带） | `pnpm build` |
| `web/` | SURMEM 官网英文站，Next.js 16 App Router | **pnpm@9** | 20 | `pnpm dev`（:3000） | `pnpm build`（standalone） |
| `cloner/` | 网站反向克隆模板，Next.js 16 × shadcn/ui × Tailwind v4 | **npm** | 24 | `npm run dev` | `npm run build` |
| `server/` | 后台接口 | **Maven** | Java | 见 `server/pom.xml` | `mvn package` |

## 部署链路（最容易踩错的地方）

**GitHub Actions 只执行仓库根目录的 `.github/workflows/`。** 子目录里的 `ADP/.github/workflows/*.yml`（9 个）和 `cloner/.github/workflows/ci.yml` 全是死文件，一次都不会跑。判断"这个项目用什么包管理器"，必须看根目录的 workflow，不是子目录的。

真正在跑的只有两个：

- **`build.yml`** —— 每次 push main 触发，或手动
  - `build-cloner`：`cloner/` 下 `npm ci`，产物打 tar.gz 传 artifact
  - `build-adp`：`ADP/` 下 `pnpm install --no-frozen-lockfile` + `pnpm build`，`dist/` 推到 `adp-dist` 分支
  - 日志与状态推到 `ci-status` 分支，失败也写
- **`build-web.yml`** —— push main 且 `web/**` 有变动时触发
  - `web/` 下 `pnpm install --frozen-lockfile` + `pnpm build`
  - 产物是 standalone 运行目录，剔除 `public/products/pool`，按 90MB 分卷推到 `web-out` 分支
  - 构建期会校验预渲染页面数 ≥1000，低于此值直接失败

部署机器拿产物就是 clone 对应分支，不需要 PAT。

## 硬约束（Do NOT）

- **不要改 `ADP/src/services/ant-design-pro/`** —— 那是 `pnpm openapi` 生成的，下次生成会覆盖。要改就改 `config/` 里的 openapi 配置后重新生成。
- **不要在 `ADP/` 里跑 npm，也不要在 `cloner/` 里跑 pnpm。** 锁文件已经按上表定死，混用会让 CI 和你本地装出不同的依赖树。
- **不要删 `web/pnpm-lock.yaml`** —— `build-web.yml` 用的是 `--frozen-lockfile`，缺了直接构建失败。
- **不要把 `cloner/public/static`、`cloner/public/ueditor`、`cloner/public/uploads` 当成垃圾清掉** —— 已被根 `.gitignore` 排除，生产环境由后端 `/media` 统一供图。
- **`ADP` 的 `pnpm simple` 不可逆** —— 跑之前先 commit 或开分支。
- **`.umi` 目录是自动生成的** —— dev server 抽风就删掉 `ADP/src/.umi` 重启，不要手动改它。

## 提交规范

Conventional Commits，`ADP/.commitlintrc.js` 会拦。

## 两道闸门

**动手前**（任何改动都过）：这个改动影响哪几个子项目？会不会碰上面任何一条 Do NOT？验证方式是什么？三个问题里有一个答不上来，先补齐再动手。

**提交前**：`ADP` 跑 `pnpm lint`（Biome + tsc）且 `npx antd lint ./src` 通过；`web` 跑 `pnpm typecheck`；`cloner` 跑 `npm run check`（lint + typecheck + build）。

## 已知欠债

- 仓库体积 238MB，但当前工作树里最大的单文件只有 `ADP/package-lock.json`（1.1MB）。差额全是历史提交里进去过的 node_modules / 构建产物 / 大图，被删了但 git 对象还在。
- `ADP` 同时存在 `package-lock.json` 与 `pnpm-lock.yaml`。CI 用 pnpm，`package-lock.json` 是上游 Ant Design Pro 模板带的，暂时保留以免破坏本地用 npm 的习惯。真要清，先确认没人在本地用 npm。
- `ADP` 的 CI 用 Node 20，但 `ADP/package.json` 写的是 `>=22`。目前能过是因为没用到 22 才有的特性，但这是个定时炸弹。
- `server/` 没有 CI，也没有在本仓库的构建链路里，改它不会触发任何流水线。
