"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { Heading } from "@/lib/toc";

/** "On this page" list; the marker springs to whichever heading was last scrolled past. */
export default function Toc({ items }: { items: Heading[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((h) => document.getElementById(h.id)).filter((e): e is HTMLElement => !!e);
    const onScroll = () => {
      let current = els[0]?.id;
      for (const el of els) if (el.getBoundingClientRect().top < innerHeight * 0.3) current = el.id;
      setActive(current);
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, [items]);

  return (
    <nav aria-label="On this page">
      <p className="font-medium">On this page</p>
      <ol className="mt-3">
        {items.map((h) => (
          <li key={h.id} className="relative">
            {active === h.id && (
              <motion.span layoutId="toc-marker" className="absolute top-0 left-0 h-full w-1 bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
            )}
            <a
              href={`#${h.id}`}
              aria-current={active === h.id ? "location" : undefined}
              className={`t-small block py-1.5 transition-colors duration-150 ${h.depth === 3 ? "pl-8" : "pl-4"} ${active === h.id ? "text-ink" : "text-muted hover:text-ink"}`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
