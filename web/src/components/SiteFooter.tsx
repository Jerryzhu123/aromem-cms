/**
 * 页脚：品牌行 + 联系方式（后台维护、动态覆盖）+ 版权。
 * 文案按当前语言（/zh 前缀即中文站）切换。
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import DynamicContact from "@/components/DynamicContact";
import { FOOTER, NAV } from "@/data/site";
import { FOOTER as FOOTER_ZH, NAV as NAV_ZH } from "@/data/site-zh";

export default function SiteFooter() {
  const pathname = usePathname();
  const isZh = pathname.startsWith("/zh");
  const footer = isZh ? FOOTER_ZH : FOOTER;
  const nav = isZh ? NAV_ZH : NAV;

  return (
    <footer className="site-foot">
      <div className="wrap foot">
        <div>
          <div className="logo">
            SUR<span>MEM</span>
          </div>
          <div>{footer.tagline}</div>
          {/* 联系方式：ADP 后台回填后自动显示，拉不到则整块不渲染 */}
          <DynamicContact />
        </div>
        <nav aria-label="Footer">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{ marginRight: 16 }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div>{footer.copyright}</div>
      </div>
    </footer>
  );
}
