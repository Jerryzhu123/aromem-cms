"use client";

/**
 * 新版页头：粘性置顶 + 六栏目导航（antd Tabs 标签页）+ 语言 Select + 移动端抽屉。
 *
 * - 双语结构：英文站 = 根路径（/），中文站 = /zh 段，与旧站路径结构一致；
 *   当前语言由 pathname 派生（/zh 前缀即中文站）；
 * - 语言 Select：EN ↔ ZH 站内切换（跳对应语言首页），行为复刻旧站的
 *   「点语言进对应语言版本」；
 * - 导航组件：antd Tabs。桌面端横向标签页，移动端抽屉内用纵向标签页
 *   （tabPosition="left"），全站导航只有这一套形态，交互保持一致；
 * - 只用标签栏：items 不带内容面板，内容区由样式隐藏，避免出现空的面板区；
 * - 标签内容用 next/link 走客户端路由：静态导出（output: "export"）同样支持
 *   路由切换，页头位于根 layout，切换时不会卸载，蓝线滑动动画得以保留；
 * - 静态导出下每个路由仍各自产出独立 HTML 文件，SEO 收录不受客户端路由影响。
 */
import { MenuOutlined } from "@ant-design/icons";
import { Button, Drawer, Dropdown, Select, Tabs } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV } from "@/data/site";
import { NAV as NAV_ZH } from "@/data/site-zh";

/** 语言选项：英文站短码 EN，中文选项用自称「中文」（选中后触发器同步显示） */
const LANGUAGES: { value: "en" | "zh"; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "zh", label: "中文" },
];

/** 语言切换落点：跳对应语言的首页（与旧站行为一致） */
const LANG_HOME: Record<"en" | "zh", string> = { en: "/", zh: "/zh" };

/** 导航条目形状（英文/中文两套 NAV 统一到它，消除联合类型调用报错） */
interface NavItem {
  label: string;
  href: string;
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // 当前语言：/zh 前缀即中文站
  const lang: "en" | "zh" = pathname.startsWith("/zh") ? "zh" : "en";
  const homeHref = lang === "zh" ? "/zh" : "/";
  const nav: readonly NavItem[] = lang === "zh" ? NAV_ZH : NAV;

  // 当前栏目：取最长匹配前缀（/zh/products 能命中 /zh/products、/zh/products/xxx）
  const activeKey =
    nav
      .slice()
      .reverse()
      .find((item) => item.href === homeHref || pathname.startsWith(item.href))
      ?.href ?? homeHref;

  // 标签内容渲染为 next/link：跳转交给 Link，Tabs 自身不做地址跳转，
  // 只负责展示与选中态。onClick 统一关抽屉，桌面端无副作用。
  const items = nav.map((item) => ({
    key: item.href,
    label: (
      <Link href={item.href} onClick={() => setOpen(false)}>
        {item.label}
      </Link>
    ),
  }));

  // 语言切换：跳对应语言首页（站内地址，整页加载与旧站行为一致）
  function switchLanguage(target: string) {
    if (target !== lang) {
      window.location.href = LANG_HOME[target as "en" | "zh"];
    }
  }

  return (
    <header className="site-head">
      <div className="wrap top">
        <Link href={LANG_HOME[lang]} aria-label="SURMEM home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="logo-img" src="/logo.png" alt="SURMEM" />
        </Link>

        <nav className="head-nav">
          <Tabs className="head-tabs" activeKey={activeKey} items={items} />
        </nav>

        <Dropdown
          menu={{
            items: LANGUAGES.map((item) => ({ key: item.value, label: item.label })),
            onClick: ({ key }) => switchLanguage(key),
            selectedKeys: [lang],
          }}
          trigger={["hover"]}
          placement="bottom"
        >
          <button type="button" className="head-lang" aria-label="Language">
            {lang === "zh" ? "中文" : "EN"}
          </button>
        </Dropdown>

        <Button
          className="head-burger"
          icon={<MenuOutlined />}
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        />
      </div>

      <Drawer
        title={
          /* eslint-disable-next-line @next/next/no-img-element */
          <img className="logo-img sm" src="/logo.png" alt="SURMEM" />
        }
        placement="right"
        open={open}
        onClose={() => setOpen(false)}
        width={300}
      >
        <Tabs
          className="drawer-tabs"
          tabPosition="left"
          activeKey={activeKey}
          items={items}
        />
        <Select
          className="drawer-lang"
          style={{ width: "100%" }}
          variant="borderless"
          value={lang}
          options={LANGUAGES}
          onChange={switchLanguage}
          aria-label="Language"
        />
      </Drawer>
    </header>
  );
}