"use client";

import { useState } from "react";
import { useInfiniteCarousel } from "@/hooks/useInfiniteCarousel";
import type { Slide } from "@/types/home";

const SPEED = 500; // ms — slick's `speed: 500`
const AUTOPLAY = 3000; // ms — slick's autoplay default

/**
 * Hero slider. The source drives this with slick (arrows, infinite, autoplay,
 * linear easing). Rather than pulling jQuery in, this rebuilds the DOM slick
 * produces — same `.slick-list` / `.slick-track` / `.slick-slide` classes — so
 * the template's own slick.css styles the arrows identically.
 */
export default function HomeSlider({ slides }: { slides: Slide[] }) {
  const count = slides.length;
  const total = count + 1; // + the cloned first slide
  const [paused, setPaused] = useState(false);
  const { pos, animate, next, prev } = useInfiniteCarousel(count, {
    autoplayMs: AUTOPLAY,
    speedMs: SPEED,
    paused,
  });

  const rendered = [...slides, slides[0]];

  return (
    <div id="mu-slider">
      <div
        className="mu-slide slick-initialized slick-slider"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <button
          className="slick-prev slick-arrow"
          type="button"
          aria-label="Previous"
          onClick={prev}
        >
          Previous
        </button>

        <div className="slick-list">
          <div
            className="slick-track"
            style={{
              width: `${total * 100}%`,
              transform: `translate3d(-${pos * (100 / total)}%, 0, 0)`,
              transition: animate ? `transform ${SPEED}ms linear` : "none",
            }}
          >
            {rendered.map((slide, i) => (
              <div
                className={`mu-single-slide slick-slide${
                  i === pos ? " slick-current slick-active" : ""
                }`}
                data-slick-index={i}
                key={`${slide.src}-${i}`}
                style={{ width: `${100 / total}%` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slide.src} alt={slide.alt} />
                <div className="mu-single-slide-content-area">
                  <div className="container">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mu-single-slide-content"> </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          className="slick-next slick-arrow"
          type="button"
          aria-label="Next"
          onClick={next}
        >
          Next
        </button>
      </div>
    </div>
  );
}
