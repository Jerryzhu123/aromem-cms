# AGENTS.md — ADP（后台管理）

Ant Design Pro 6 × Umi Max v4 × antd v6 × ProComponents v3。React 19，TypeScript strict。

**包管理器是 pnpm@9，不是 npm。** 真正在跑的是根目录 `.github/workflows/build.yml`，它用 `pnpm install` 加 `pnpm build`；`ADP/.github/workflows/ci.yml` 里写的是 `npm ci`，但子目录 workflow 不会被 GitHub 执行，那份配置从来没用过。

## 命令

| 命令 | 作用 |
|---|---|
| `pnpm start` | 开发（带 mock） |
| `pnpm dev` | 开发（不带 mock） |
| `pnpm build` | 构建（utoopack） |
| `pnpm lint` | Biome + tsc |
| `pnpm test` | Vitest |
| `pnpm tsc` | 只做类型检查 |
| `pnpm openapi` | 重新生成 `src/services/` |
| `pnpm biome` | 自动修复 |
| `pnpm simple` | ⚠️ 不可逆，先 commit |
| `npx antd lint ./src` | antd 专项检查，提交前必须过 |

## 硬约束

- **不要手改 `src/services/ant-design-pro/`** —— 那是 `pnpm openapi` 生成的
- **只用 Biome**，不用 ESLint / Prettier
- **写 antd 代码前先 `npx antd info <Component>`**，不要凭记忆猜 API
- **`pnpm simple` 不可逆** —— 跑之前先 commit 或开分支
- **Conventional Commits**，commitlint 会拦
- **`.umi` 是自动生成的** —— dev server 抽风就删 `src/.umi` 重启，不要手改

## 结构要点

- **配置**：`config/config.ts`（defineConfig）、`config/routes.ts`（声明式路由）。路由 `name` 对应 `menu.xxx` i18n key，`access` 字段控制可见性
- **约定文件**（`src/`）：`app.tsx`（运行时配置 + `getInitialState`）、`access.ts`（权限）、`global.tsx`、`loading.tsx`、`typings.d.ts`
- **鉴权**：`getInitialState()` → `GET /api/currentUser`，401 跳登录；`canAdmin = currentUser.access === 'admin'`；mock 账号 `admin` / `ant.design`
- **状态**：`useModel('filename')` 取全局 hooks（`src/models/`）；`useModel('@@initialState')` 取 currentUser/settings；数据加载优先 ProTable 的 `request`，复杂服务端状态用 `@tanstack/react-query`
- **样式优先级**：Tailwind v4（布局）→ antd-style / `createStyles`（主题 token）→ CSS Modules → Less（仅遗留）
- **请求**：用 `@umijs/max` 内置 `request`，配置在 `src/requestErrorConfig.ts`；非生成的接口放各页 `service.ts`
- **i18n**：`src/locales/` 下 8 种语言，`useIntl().formatMessage({ id, defaultMessage })`
- **Mock**：`mock/`（全局）+ `src/pages/**/_mock.ts`（就近）
- **`cloudflare-worker/`** 是独立的 Hono 应用，有自己的 `package.json`，不是 npm workspace

## 页面就近原则

每个页面目录：`index.tsx`，可选的 `service.ts`、`_mock.ts`、`data.d.ts`、样式文件。页面专属代码就跟页面放一起。

## 内置技能

- **`/pro-upgrade`** —— 拉最新 Ant Design Pro 模板与本项目 diff，合并框架变更、保留业务代码
- **`/antd`** —— `@ant-design/cli` 离线元数据，覆盖 antd v3/v4/v5/v6
  - `npx antd info <Component>` 查 API（强制）
  - `npx antd lint ./src` 查废弃用法（提交前必须过）
  - `npx antd demo <Component> <demo>` 拿可用示例
  - `npx antd migrate <from> <to>` 迁移清单
- 更新技能定义：`npx skills add ant-design/ant-design-pro`

## 待处理

- `package.json` 写的是 `node >=22`，但 `build.yml` 的 CI 用的是 Node 20。目前没用到 22 才有的特性，但迟早会炸。
- 仓里同时有 `package-lock.json` 和 `pnpm-lock.yaml`。CI 只用 pnpm，前者是上游模板带的，暂留。
