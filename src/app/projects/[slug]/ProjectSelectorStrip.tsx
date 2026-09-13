"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type StripProject = { slug: string; title: string };

export default function ProjectSelectorStrip({
  projects,
  activeSlug,
}: {
  projects: StripProject[];
  activeSlug: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateArrows() {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    // Keep the current project in view across page navigations instead of
    // always resetting the strip back to the start.
    activeRef.current?.scrollIntoView({ inline: "center", block: "nearest", behavior: "instant" });
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => updateArrows();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlug]);

  // Animated manually rather than via native `scrollBy({behavior:'smooth'})`
  // -- the browser's own smooth-scroll can silently no-op in some contexts,
  // leaving the arrow doing nothing. requestAnimationFrame always works.
  function slide(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = el.scrollLeft;
    const distance = direction * el.clientWidth * 0.8;
    const target = Math.max(0, Math.min(start + distance, el.scrollWidth - el.clientWidth));
    if (prefersReducedMotion) {
      el.scrollLeft = target;
      return;
    }
    const duration = 350;
    const startTime = performance.now();
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    function step(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      el!.scrollLeft = start + (target - start) * easeOutCubic(progress);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  return (
    <div className="relative border-b-2 border-foreground-bright bg-border-soft/30">
      <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
        <div
          ref={trackRef}
          className="scrollbar-hide flex overflow-x-auto"
        >
          {projects.map((p, idx) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              ref={p.slug === activeSlug ? activeRef : undefined}
              className={`flex-shrink-0 border-r-2 border-foreground-bright px-6 py-4 font-mono text-xs font-bold tracking-widest uppercase transition-colors ${
                p.slug === activeSlug
                  ? "bg-foreground-bright text-background"
                  : "bg-transparent text-foreground-bright hover:bg-background"
              }`}
            >
              <span className="mr-2 opacity-40">{String(idx + 1).padStart(2, "0")}</span>
              {p.title}
            </Link>
          ))}
        </div>

        {canScrollLeft && (
          <button
            type="button"
            aria-label="Show previous projects"
            onClick={() => slide(-1)}
            className="absolute top-0 left-6 flex h-full items-center bg-gradient-to-r from-border-soft via-border-soft/90 to-transparent pr-8 pl-2 sm:left-8"
          >
            <span className="flex h-8 w-8 items-center justify-center border-2 border-foreground-bright bg-background font-mono text-foreground-bright">
              &larr;
            </span>
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            aria-label="Show more projects"
            onClick={() => slide(1)}
            className="absolute top-0 right-6 flex h-full items-center bg-gradient-to-l from-border-soft via-border-soft/90 to-transparent pr-2 pl-8 sm:right-8"
          >
            <span className="flex h-8 w-8 items-center justify-center border-2 border-foreground-bright bg-background font-mono text-foreground-bright">
              &rarr;
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
