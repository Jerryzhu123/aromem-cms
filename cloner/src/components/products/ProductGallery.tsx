"use client";

import { useState } from "react";
import { fcBlocks } from "@/data/fcBlocks";
import type { FcLocale } from "@/data/fcText";

/**
 * 产品图库：主图 + 缩略图 + 灯箱放大（中英文共用）。
 *
 * 不引入新的灯箱依赖（站点现有的 magnific-popup 是 jQuery 插件，会用坏 RSC 渲染）；
 * 这里用原生 button + 固定定位遮罩实现，键盘 Esc / 点击遮罩关闭。
 * 只有一张图时（当前占位阶段）不显示缩略图条，改为提示图库待入库。
 */
export default function ProductGallery({
  images,
  alt,
  locale = "en",
}: {
  images: string[];
  alt: string;
  locale?: FcLocale;
}) {
  const g = fcBlocks(locale).gallery;
  const list = images.filter(Boolean);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  const current = list[Math.min(active, list.length - 1)];
  if (!current) return null;

  return (
    <div className="fc-gallery">
      <button
        type="button"
        className="fc-gallery-main"
        onClick={() => setOpen(true)}
        aria-label={g.enlarge}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current} alt={alt} />
        <span className="fc-gallery-zoom">{g.enlarge}</span>
      </button>

      {list.length > 1 ? (
        <div className="fc-gallery-thumbs">
          {list.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              className={index === active ? "is-active" : undefined}
              onClick={() => setActive(index)}
              aria-label={`${alt} ${index + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      ) : (
        <p className="fc-hint">{g.pendingThumbs}</p>
      )}

      {open ? (
        <div
          className="fc-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current} alt={alt} />
          <button type="button" className="fc-lightbox-close" onClick={() => setOpen(false)}>
            {g.close}
          </button>
        </div>
      ) : null}
    </div>
  );
}
