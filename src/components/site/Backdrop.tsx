"use client";

import { useEffect, useRef } from "react";
import { swirlMaskUrl } from "@/lib/swirl";

/**
 * The page ground: hand-engraving style curls (lib/swirl.ts) in a lighter navy, fixed behind
 * everything. Built on the client after first paint so the path data stays out of the HTML.
 */
export default function Backdrop() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.style.setProperty("--swirl", swirlMaskUrl());
    ref.current?.classList.add("is-ready");
  }, []);
  return (
    <div className="backdrop" aria-hidden>
      <div ref={ref} />
    </div>
  );
}
