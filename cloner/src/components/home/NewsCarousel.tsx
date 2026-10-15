"use client";

import { useEffect, useRef, useState } from "react";
import { useInfiniteCarousel } from "@/hooks/useInfiniteCarousel";
import type { NewsSlide } from "@/types/home";

const SLIDE_WIDTH = 450; // px — the source's fixed slide width
const IMAGE_RATIO = 2 / 3; // the source's 450x300 image box
const CAPTION_STRIP = 60; // px — two 30px caption lines, per the source's 450x360 slide
// 450 * 2/3 + 60 = 360, i.e. the source's hard-coded slide box.

/**
 * The "新闻资讯" image carousel. The source implements it with a hand-written
 * jQuery snippet (3000 ms autoplay, hover indicators, prev/next arrows that fade
 * in on hover). The behaviour is reproduced here; the container additionally
 * shrinks below 450 px so it no longer overflows on phones.
 */
export default function NewsCarousel({ slides }: { slides: NewsSlide[] }) {
  const count = slides.length;
  const total = count + 1; // + cloned first slide
  const [hovering, setHovering] = useState(false);
  const { pos, animate, next, prev, jumpTo, activeIndex } = useInfiniteCarousel(
    count,
    { autoplayMs: 3000, speedMs: 1000, paused: hovering },
  );

  // The source hard-codes a 450x360 box; measure the available width instead so
  // it fits small screens, and derive the height from it. Keeping the *derived*
  // height is what stops the box from leaving a dark band under the caption once
  // the image has scaled down: 450 -> 360 (the source's own numbers), 345 -> 290.
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(SLIDE_WIDTH);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth || SLIDE_WIDTH);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const height = Math.round(width * IMAGE_RATIO + CAPTION_STRIP);

  const rendered = [...slides, slides[0]];

  return (
    <div id="wrapper1">
      <div
        id="show-area1"
        ref={containerRef}
        style={{ width: "100%", maxWidth: SLIDE_WIDTH, height }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <ul
          style={{
            width: width * total,
            height,
            transform: `translate3d(${-pos * width}px, 0, 0)`,
            transition: animate ? "transform 1000ms ease-in-out" : "none",
          }}
        >
          {rendered.map((slide, i) => (
            <li key={`${slide.image}-${i}`} style={{ width, textAlign: "center" }}>
              <a href={slide.href}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slide.image} height={300} width={450} alt={slide.caption} />
              </a>
              {slide.caption}
            </li>
          ))}
        </ul>

        <div
          id="button-left1"
          title="上一张"
          style={{ opacity: hovering ? 0.5 : 0 }}
          onClick={prev}
        >
          {"<"}
        </div>
        <div
          id="button-right1"
          title="下一张"
          style={{ opacity: hovering ? 0.5 : 0 }}
          onClick={next}
        >
          {">"}
        </div>
        {/* mystyle.css pins the dots at `top: 270px`, which is 30px above the
            bottom edge of the source's 300px-tall image. Deriving that offset
            from the scaled image height keeps them on the image at every width
            (450 -> 270, exactly the source's value). */}
        <div
          id="indicator1"
          style={{ top: Math.round(width * IMAGE_RATIO) - 30 }}
        >
          {slides.map((slide, i) => (
            <div
              className={i === activeIndex ? "onclick" : undefined}
              key={`dot-${slide.image}-${i}`}
              onMouseEnter={() => jumpTo(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
