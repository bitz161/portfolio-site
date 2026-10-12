"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useVelocity } from "motion/react";
import { speedup } from "@/lib/site";

/**
 * Before/after card you can throw: it tilts with drag velocity, springs home,
 * and a fling (or a click / Enter) flips it to the other side.
 */
export default function MetricCard({ before, after, label }: { before: string; after: string; label: string | null }) {
  const [flipped, setFlipped] = useState(false);
  const dragged = useRef(false); // a drag ends with a native click; ignore that one
  const x = useMotionValue(0);
  const vx = useVelocity(x);
  const tilt = useSpring(useTransform(vx, [-2000, 2000], [-14, 14], { clamp: true }), { stiffness: 300, damping: 30 });

  const factor = speedup(before, after);

  return (
    <div className="[perspective:1000px]">
      <motion.button
        type="button"
        aria-label={`Show ${flipped ? "before" : "after"} value`}
        onClick={() => {
          if (!dragged.current) setFlipped((f) => !f);
        }}
        onDragStart={() => (dragged.current = true)}
        drag="x"
        dragSnapToOrigin
        dragElastic={0.5}
        dragTransition={{ bounceStiffness: 180, bounceDamping: 12 }}
        onDragEnd={(_, info) => {
          setTimeout(() => (dragged.current = false)); // after the trailing click, if any
          if (Math.abs(info.offset.x) > 60 || Math.abs(info.velocity.x) > 500) setFlipped((f) => !f);
        }}
        style={{ x, rotateZ: tilt }}
        whileTap={{ scale: 1.03, cursor: "grabbing" }}
        className="relative block h-56 w-full cursor-grab touch-pan-y text-left"
      >
        <motion.div
          className="relative h-full w-full [transform-style:preserve-3d]"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 160, damping: 18 }}
        >
          <Face side="Before" value={before} label={label} tone="text-muted" />
          <Face side="After" value={after} label={label} tone="text-brass-soft" back factor={factor} />
        </motion.div>
      </motion.button>
      <p className="mt-3 text-center font-mono text-xs text-muted">Drag, fling or click to flip</p>
    </div>
  );
}

function Face({ side, value, label, tone, back, factor }: { side: string; value: string; label: string | null; tone: string; back?: boolean; factor?: number | null }) {
  return (
    <div
      className={`surface absolute inset-0 flex flex-col justify-between p-6 [backface-visibility:hidden] ${back ? "[transform:rotateY(180deg)]" : ""}`}
      style={{ background: back ? "linear-gradient(150deg, color-mix(in srgb, var(--color-brass) 16%, #15161a), #111215)" : "linear-gradient(150deg, #1b1e24, #111215)" }}
    >
      <span className="label">{side}</span>
      <span className={`font-display text-6xl leading-none ${tone}`}>{value}</span>
      <span className="text-sm text-muted">
        {label}
        {back && factor ? <span className="ml-2 text-ink">· {factor.toFixed(1)}× faster</span> : null}
      </span>
    </div>
  );
}
