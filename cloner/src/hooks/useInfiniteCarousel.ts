"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Options {
  /** Milliseconds between automatic advances. Pass `0` to disable. */
  autoplayMs?: number;
  /** Transition duration in milliseconds. */
  speedMs?: number;
  /** Pause autoplay (e.g. while the pointer hovers the carousel). */
  paused?: boolean;
}

/**
 * Infinite carousel state shared by the hero slider and the news carousel.
 *
 * Both originals are infinite jQuery/slick sliders. The trick used by both is
 * the same: render one extra clone of the first item, advance into it, then
 * snap back to the real first item without a transition. `pos` therefore ranges
 * over `0..count`, where `count` is the clone.
 */
export function useInfiniteCarousel(count: number, options: Options = {}) {
  const { autoplayMs = 0, speedMs = 500, paused = false } = options;
  const [pos, setPos] = useState(0);
  const [animate, setAnimate] = useState(true);
  const pendingPrev = useRef(false);

  const next = useCallback(() => {
    setAnimate(true);
    setPos((p) => (p >= count ? p : p + 1));
  }, [count]);

  const prev = useCallback(() => {
    setPos((p) => {
      if (p <= 0) {
        // silently jump onto the clone, then step back onto the last real slide
        pendingPrev.current = true;
        setAnimate(false);
        return count;
      }
      setAnimate(true);
      return p - 1;
    });
  }, [count]);

  /** Used by the dot indicators, which jump straight to a slide. */
  const jumpTo = useCallback(
    (target: number) => {
      setAnimate(true);
      setPos(Math.max(0, Math.min(count - 1, target)));
    },
    [count],
  );

  useEffect(() => {
    if (!autoplayMs || paused || count <= 1) return;
    const timer = setInterval(next, autoplayMs);
    return () => clearInterval(timer);
  }, [autoplayMs, paused, count, next]);

  // Reached the clone -> snap back to the real first slide.
  useEffect(() => {
    if (!animate || pos !== count) return;
    const timer = setTimeout(() => {
      setAnimate(false);
      setPos(0);
    }, speedMs);
    return () => clearTimeout(timer);
  }, [animate, pos, count, speedMs]);

  // Backwards wrap: after the silent jump, animate one slide back.
  useEffect(() => {
    if (!pendingPrev.current || animate || pos !== count) return;
    pendingPrev.current = false;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimate(true);
        setPos(count - 1);
      });
    });
    return () => cancelAnimationFrame(id);
  }, [animate, pos, count]);

  // Re-arm the transition after any silent jump.
  useEffect(() => {
    if (animate || pendingPrev.current) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimate(true));
    });
    return () => cancelAnimationFrame(id);
  }, [animate]);

  return {
    pos,
    animate,
    next,
    prev,
    jumpTo,
    /** Index of the slide actually on screen (the clone maps back to 0). */
    activeIndex: pos >= count ? 0 : pos,
  };
}
