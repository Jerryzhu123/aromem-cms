"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { NavItem } from "@/types/content";

interface SiteHeaderProps {
  nav: NavItem[];
  /** Landing page for the logo, `/` for English and `/zh` for Chinese. */
  home: string;
  /** Which language is currently highlighted in the language switcher. */
  lang: "zh" | "en";
}

/**
 * Reproduces the source site's <header id="mu-hero">.
 *
 * The original relies on Bootstrap's JS for the hamburger and the dropdowns;
 * here the same classes are driven by React state instead, so the rendered
 * markup (and therefore the CSS) stays identical.
 *
 * 2026-10-10 新增：页头常驻询价入口（方案第 2.1 节），中英文各自指向本站语言的询价页。
 * 现有站点全站没有任何表单与页头 CTA，询价只能靠 contact 页；
 * 因此在这个共享组件上加入口，让每个页面都能一步进询价。
 */
export default function SiteHeader({ nav, home, lang }: SiteHeaderProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  const zh = lang === "zh";

  // Close an open dropdown when clicking anywhere outside the header.
  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!headerRef.current) return;
      if (!headerRef.current.contains(event.target as Node)) setOpenLabel(null);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  /** Any navigation closes the menus, like the original's full page loads did. */
  function closeMenus() {
    setCollapsed(false);
    setOpenLabel(null);
  }

  function isActive(href: string) {
    const path = href.split("?")[0];
    if (!path || path === "/" || path === "/zh") return pathname === path;
    return pathname === path;
  }

  return (
    <header id="mu-hero" data-lang={lang} ref={headerRef}>
      <div className="container">
        <nav className="navbar navbar-expand-lg navbar-light mu-navbar">
          <a className="navbar-brand mu-logo" href={home} onClick={closeMenus}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/static/index/images/suro_logo.png" alt="苏瑞膜 SURO" />
          </a>

          <button
            className="navbar-toggler"
            type="button"
            aria-controls="navbarSupportedContent"
            aria-expanded={collapsed}
            aria-label="Toggle navigation"
            onClick={() => setCollapsed((v) => !v)}
          >
            <span className="fa fa-bars" />
          </button>

          <div
            className={`collapse navbar-collapse${collapsed ? " show" : ""}`}
            id="navbarSupportedContent"
          >
            <ul className="navbar-nav mr-auto mu-navbar-nav">
              {nav.map((item) => {
                const active = isActive(item.href);
                if (!item.children?.length) {
                  return (
                    <li className={`nav-item${active ? " active" : ""}`} key={item.label}>
                      <a href={item.href} onClick={closeMenus}>
                        {item.label}
                      </a>
                    </li>
                  );
                }
                const open = openLabel === item.label;
                return (
                  <li
                    className={`nav-item dropdown${active ? " active" : ""}`}
                    key={item.label}
                  >
                    {/* A plain <a>, not <Link>: the source's Bootstrap dropdown
                        also swallows the click, so the parent never navigates —
                        only the items inside the menu do. */}
                    <a
                      className="dropdown-toggle"
                      href={item.href}
                      role="button"
                      aria-haspopup="true"
                      aria-expanded={open}
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenLabel(open ? null : item.label);
                      }}
                    >
                      {item.label}
                    </a>
                    <div className={`dropdown-menu${open ? " show" : ""}`}>
                      {item.children.map((child) => (
                        <a
                          className="dropdown-item"
                          href={child.href}
                          key={child.label}
                          onClick={closeMenus}
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  </li>
                );
              })}

              {/* 新增：页头常驻询价入口（中英文都开）。
                  按钮样式在 mu-nav-fix.css 的 .mu-quote-btn 里，跟导航行一起受控。 */}
              <li className="nav-item mu-quote">
                <a
                  className="mu-quote-btn"
                  href={zh ? "/zh/request-a-quote" : "/request-a-quote"}
                  onClick={closeMenus}
                >
                  {zh ? "获取报价" : "Request a Quote"}
                </a>
              </li>

              <li
                className={`nav-item dropdown mu-lang${openLabel === "__lang__" ? " open" : ""}`}
              >
                <a
                  className="dropdown-toggle"
                  href="#"
                  role="button"
                  aria-haspopup="true"
                  aria-expanded={openLabel === "__lang__"}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenLabel(openLabel === "__lang__" ? null : "__lang__");
                  }}
                >
                  <span style={{ fontSize: 12, color: "#09C" }}>
                    {zh ? "语言" : "Language"}
                  </span>
                </a>
                <div className={`dropdown-menu${openLabel === "__lang__" ? " show" : ""}`}>
                  {/* 站内导航统一用原生 a：无 Next 客户端路由，杜绍 RSC 预取请求 */}
                  {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                  <a className="dropdown-item" href="/zh" onClick={closeMenus}>
                    <span style={{ fontSize: 12, color: zh ? "#09C" : undefined }}>中文</span>
                  </a>
                  <a className="dropdown-item" href="/" onClick={closeMenus}>
                    <span style={{ fontSize: 12, color: zh ? undefined : "#09C" }}>
                      English
                    </span>
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
}
