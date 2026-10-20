/**
 * 「最近浏览」——原站是 localStorage + Swiper 轮播（最多 6 条，992 以上一行 5 张）。
 * 本站不引轮播库，用可横向滚动的网格实现同等观感；数据存在 dl-history 键下。
 */
"use client";

import { useEffect, useState } from "react";

type Entry = { slug: string; img: string; name: string; href: string };

const KEY = "dl-history";
const MAX = 6;

export default function DarllyRecentViewed({
  current,
  title,
}: {
  current: Entry;
  title: string;
}) {
  const [items, setItems] = useState<Entry[]>([current]);

  useEffect(() => {
    let list: Entry[] = [];
    try {
      const raw = window.localStorage.getItem(KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        list = parsed.filter(
          (e): e is Entry =>
            typeof e === "object" &&
            e !== null &&
            typeof (e as Entry).slug === "string" &&
            typeof (e as Entry).href === "string",
        );
      }
    } catch {
      list = [];
    }
    /* 当前商品置顶并去重，最多留 6 条 */
    const next = [current, ...list.filter((e) => e.slug !== current.slug)].slice(0, MAX);
    setItems(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* 隐私模式下写入失败不影响浏览 */
    }
  }, [current]);

  return (
    <section>
      <div className="dl-history">
        <div className="dl-container">
          <div className="dl-history-header">{title}</div>
          <div className="dl-history-body">
            {items.map((e) => (
              <a className="dl-history-card" key={e.slug} href={e.href}>
                <img src={e.img} alt={e.name} loading="lazy" />
                <p>{e.name}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
