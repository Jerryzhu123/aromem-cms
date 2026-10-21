/**
 * 后端接口基地址（全站唯一一处计算）。
 *
 * 构建期与运行期的地址不同：
 *   - 服务器上的页面进程与后端同机，走 127.0.0.1:8080 能省掉一圈公网往返；
 *   - GitHub Actions 的构建机没有内网路径，必须走公网域名。
 *
 * 所以由部署环境用环境变量区分。CMS_API_BASE 是正式名；
 * POOL_API_BASE 是泳池商品先落地时用的旧名，保留兼容，避免现网 systemd 单元
 * 因为改名而丢配置（改名要同时改单元文件，没必要为了好看冒这个风险）。
 */

export const API_BASE = (
  process.env.CMS_API_BASE ||
  process.env.POOL_API_BASE ||
  "https://www.surmem.com"
).replace(/\/$/, "");
