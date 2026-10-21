/**
 * 缓存再生成入口。后台保存成功后由服务端调用，吊销指定标签的页面缓存。
 *
 * 为什么需要它：
 *   页面在构建期预渲染，访问命中缓存。数据变了以后，缓存本身不知道，
 *   必须有外部信号通知它失效。这个接口就是这个信号。
 *
 * 调用方式（只允许服务端调用，且必须带密钥）：
 *   POST /api/revalidate?tag=pool
 *   Header: x-revalidate-secret: <REVALIDATE_SECRET>
 *
 * 安全边界：
 *   - 密钥从环境变量读，未配置时整个接口拒绝服务（不接受「没配就是无密码」）；
 *   - 标签走白名单，不接受任意值，避免被拿来吊销整个站点；
 *   - 只暴露 POST，不提供 GET，避免被浏览器预取或爬虫误触。
 *
 * 响应遵循标准 HTTP 语义：成功 200、未授权 401、服务端未配置 500。
 */

import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

/** 允许吊销的标签清单。新增数据源时在这里登记，不做通配。 */
const ALLOWED_TAGS = new Set(["pool"]);

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  // 没配密钥就在生产环境开放这个接口，等于把「任何人清空站点缓存」的权力送出去
  if (!secret) {
    return NextResponse.json(
      { code: 500, msg: "服务端未配置 REVALIDATE_SECRET，拒绝执行" },
      { status: 500 },
    );
  }

  const provided = request.headers.get("x-revalidate-secret");
  if (provided !== secret) {
    return NextResponse.json({ code: 401, msg: "密钥不正确" }, { status: 401 });
  }

  const tag = request.nextUrl.searchParams.get("tag") ?? "pool";
  if (!ALLOWED_TAGS.has(tag)) {
    return NextResponse.json(
      { code: 400, msg: `未知标签 ${tag}，允许的取值：${[...ALLOWED_TAGS].join(", ")}` },
      { status: 400 },
    );
  }

  // 第二参数是「陈旧内容还能给多久」的窗口。
  // 官方对「外部服务调 Route Handler」这一场景明确建议 { expire: 0 }：
  // 不提供陈旧内容，下一个请求直接阻塞式重新渲染。
  // 这里必须用它而不是推荐值 "max"——后台改完，运营马上刷新核对，
  // 若走「先给旧内容、后台再更新」，第一次看到的还是旧数据，会误判成没生效。
  revalidateTag(tag, { expire: 0 });

  return NextResponse.json({
    code: 200,
    msg: "success",
    data: { tag, at: new Date().toISOString() },
  });
}
