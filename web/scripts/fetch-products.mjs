/**
 * 构建期取数：从后台接口拉泳池滤芯全量，落成一份 JSON 快照。
 *
 * 为什么在构建前拉、而不是页面里直接 fetch：
 *   1. 静态导出（output: "export"）下 495 个页面在构建期一次性生成，
 *      页面里各自 fetch 会重复请求上百次；
 *   2. 落盘后可以 diff、可以回滚，出问题知道是哪一次的数据；
 *   3. 接口临时不可用时还能用上一次的快照，构建不至于直接失败。
 *
 * 数据流向：
 *   GET /api/v1/filter-cartridges/products?series=pool   495 条型号 + 规格
 *   GET /api/v1/cross-reference?series=pool              1079 条替换件号
 *   ↓ 合并成前台既有的 PoolItem / PoolDetail 形状
 *   src/data/__generated__/pool.json
 *
 * 兜底顺序：接口 → 上次快照 → 编译期常量（pool.ts / pool-detail.ts）。
 * 第三级兜底保证「后台连不上也一定能出站」，代价是数据退回旧值，
 * 因此失败时会把警告打到 stderr，构建日志里一眼能看到。
 *
 * 用法：node scripts/fetch-products.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "src/data/__generated__");
const OUT_FILE = path.join(OUT_DIR, "pool.json");
const API_BASE = (process.env.POOL_API_BASE || "https://www.surmem.com").replace(/\/$/, "");
const TIMEOUT_MS = 20000;

function warn(msg) {
  console.error(`[pool] ${msg}`);
}

async function getJson(url) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctl.signal, headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    // 后端契约为 {code,msg,data}
    if (body && typeof body === "object" && "code" in body) {
      if (body.code !== 200) throw new Error(`code=${body.code} msg=${body.msg}`);
      return body.data;
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
}

/** 接口行 → PoolItem（字段与 src/data/pool.ts 的 PoolItem 完全一致） */
function toPoolItem(row) {
  const gallery = Array.isArray(row.gallery) ? row.gallery.filter(Boolean) : [];
  return {
    slug: row.slug,
    sku: row.model,
    name: row.title,
    nameZh: row.titleZh || row.title,
    sqft: typeof row.sqft === "number" ? row.sqft : null,
    img: gallery[0] || "",
    images: gallery,
  };
}

/** 接口行 + 对照行 → PoolDetail（字段与 src/data/pool-detail.ts 的 PoolDetail 一致） */
function toPoolDetail(row, replacements) {
  const gallery = Array.isArray(row.gallery) ? row.gallery.filter(Boolean) : [];
  return {
    sku: row.model,
    od: row.outsideDiameter || "",
    length: row.overallLength || "",
    top: row.endCapTop || "",
    bottom: row.endCapBottom || "",
    maker: row.oemMachine || "",
    replacements,
    images: gallery,
  };
}

/** 从编译期常量抽取（兜底第三级）：复用 _compare/pool-migrate 的括号配对思路 */
function readConst(file, name) {
  const src = fs.readFileSync(path.join(ROOT, "src/data", file), "utf8");
  const at = src.indexOf(`export const ${name}`);
  if (at < 0) throw new Error(`${file} 里找不到 ${name}`);
  // 必须从赋值号之后找起始括号：类型标注里的 PoolItem[] 也带方括号，
  // 从声明位置起找会命中那个空数组，抽出来是 []。
  const eq = src.indexOf("=", src.indexOf(name, at) + name.length);
  if (eq < 0) throw new Error(`${file}:${name} 缺少赋值号`);
  const start = src.indexOf("[", eq);
  const startObj = src.indexOf("{", eq);
  const from = start >= 0 && (startObj < 0 || start < startObj) ? start : startObj;

  let depth = 0;
  let quote = null;
  for (let j = from; j < src.length; j++) {
    const c = src[j];
    if (quote) {
      if (c === "\\") j++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      continue;
    }
    if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}") {
      depth--;
      if (depth === 0) {
        // eslint-disable-next-line no-new-func
        return new Function(`return (${src.slice(from, j + 1)});`)();
      }
    }
  }
  throw new Error(`${file}:${name} 括号未配平`);
}

function fromConstants() {
  const items = readConst("pool.ts", "POOL_ITEMS");
  const details = readConst("pool-detail.ts", "POOL_DETAILS");
  return {
    items,
    details: Object.fromEntries(Object.entries(details).map(([k, v]) => [k, v])),
  };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // dev 启动时别为了一次取数卡住热更新：本地已有快照就直接用
  if (process.argv.includes("--if-missing") && fs.existsSync(OUT_FILE)) {
    const kb = (fs.statSync(OUT_FILE).size / 1024).toFixed(1);
    console.log(`[pool] 快照已存在（${kb} KB），跳过取数`);
    return;
  }

  let products = null;
  let xref = null;
  let source = "api";

  try {
    products = await getJson(`${API_BASE}/api/v1/filter-cartridges/products?series=pool`);
    if (!Array.isArray(products) || products.length === 0) {
      throw new Error("接口返回空清单（后台还没数据？）");
    }
    xref = await getJson(`${API_BASE}/api/v1/cross-reference?series=pool`);
    if (!Array.isArray(xref)) xref = [];
  } catch (e) {
    warn(`接口取数失败：${e.message}`);
    // 二级兜底：沿用上一次的快照
    if (fs.existsSync(OUT_FILE)) {
      const prev = JSON.parse(fs.readFileSync(OUT_FILE, "utf8"));
      warn(`沿用上次快照（${prev.generatedAt}，${prev.count} 条）`);
      return;
    }
    // CI 上不兜底：静默用旧常量会让线上数据悄悄退回旧版，比构建失败更危险。
    // 本地开发则允许回退，免得接口没起就完全没法调页面。
    if (process.env.CI) {
      throw new Error("接口不可用且无历史快照，按原则中止构建（CI 环境不允许静默兜底）");
    }
    source = "fallback";
  }

  let payload;

  if (source === "api") {
    // 对照行按 SURMEM 型号分组，拼回 "Unicel: C-9999" 形态
    const byModel = new Map();
    for (const r of xref) {
      const key = r.surmemModel;
      if (!key) continue;
      if (!byModel.has(key)) byModel.set(key, []);
      byModel.get(key).push(`${r.brand}: ${r.oemModel}`);
    }

    const items = [];
    const details = {};
    for (const row of products) {
      const it = toPoolItem(row);
      items.push(it);
      details[it.sku] = toPoolDetail(row, byModel.get(it.sku) ?? []);
    }
    payload = {
      generatedAt: new Date().toISOString(),
      source: "api",
      apiBase: API_BASE,
      count: items.length,
      items,
      details,
    };
  } else {
    warn("回退到编译期常量（数据可能不是最新）");
    const fb = fromConstants();
    payload = {
      generatedAt: new Date().toISOString(),
      source: "fallback",
      apiBase: null,
      count: fb.items.length,
      items: fb.items,
      details: fb.details,
    };
  }

  // 自检：条数、必填、slug 唯一
  if (payload.count < 400) throw new Error(`条数异常：${payload.count}（预期 495 上下）`);
  const bad = payload.items.filter((i) => !i.slug || !i.sku || !i.name);
  if (bad.length) throw new Error(`必填为空：${bad.length} 条`);
  const uniq = new Set(payload.items.map((i) => i.slug));
  if (uniq.size !== payload.items.length) throw new Error(`slug 重复 ${payload.items.length - uniq.size} 个`);

  fs.writeFileSync(OUT_FILE, JSON.stringify(payload, null, 0), "utf8");
  const kb = (fs.statSync(OUT_FILE).size / 1024).toFixed(1);
  console.log(
    `[pool] 快照已写入 ${path.relative(ROOT, OUT_FILE)}：${payload.count} 条，来源 ${payload.source}，${kb} KB`,
  );
}

main().catch((e) => {
  console.error(`[pool] 取数失败终止：${e.message}`);
  process.exit(1);
});
