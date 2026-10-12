"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, MotionConfig, useInView, useSpring } from "motion/react";

export const EMPH = [0.05, 0.7, 0.1, 1] as const;
export const STD = [0.2, 0, 0, 1] as const;

/** App-wide: honor the OS reduce-motion setting (transforms off, opacity fades stay). */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** Fades + rises into view once. `i` staggers siblings by 90 ms. */
export function Reveal({ children, i = 0, className }: { children: ReactNode; i?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, ease: EMPH, delay: i * 0.09 }}
    >
      {children}
    </motion.div>
  );
}

/** Counts from 0 to `to` with an exponential ease-out when scrolled into view. */
export function CountUp({ to, decimals = 0, suffix = "" }: { to: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.8, ease: [0.16, 1, 0.3, 1], onUpdate: setV });
    return () => c.stop();
  }, [inView, to]);
  return (
    <span ref={ref} className="tabular-nums">
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/** Pulls its child toward the cursor when the pointer is near, springs back on leave. */
export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 220, damping: 14 });
  const y = useSpring(0, { stiffness: 220, damping: 14 });
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const near = Math.hypot(dx, dy) < Math.max(r.width, 120);
      x.set(near ? dx * strength : 0);
      y.set(near ? dy * strength : 0);
    };
    addEventListener("pointermove", onMove);
    return () => removeEventListener("pointermove", onMove);
  }, [x, y, strength]);
  return (
    <motion.div ref={ref} style={{ x, y }} className="inline-block">
      {children}
    </motion.div>
  );
}

/** Ambient layer: three blurred orbs drifting (CSS) plus cursor parallax (springs). Orb 2 counter-moves. */
export function Orbs() {
  const depths = [70, -100, 45];
  const springs = [
    [useSpring(0, { stiffness: 40, damping: 12 }), useSpring(0, { stiffness: 40, damping: 12 })],
    [useSpring(0, { stiffness: 40, damping: 12 }), useSpring(0, { stiffness: 40, damping: 12 })],
    [useSpring(0, { stiffness: 40, damping: 12 }), useSpring(0, { stiffness: 40, damping: 12 })],
  ];
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / innerWidth - 0.5;
      const ny = e.clientY / innerHeight - 0.5;
      springs.forEach(([sx, sy], i) => {
        sx.set(nx * depths[i]);
        sy.set(ny * depths[i]);
      });
    };
    addEventListener("pointermove", onMove);
    return () => removeEventListener("pointermove", onMove);
    // springs/depths are stable for the component's life
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const orbs = [
    { pos: "left-[5%] top-[6%]", size: "h-[440px] w-[440px]", color: "bg-steel", extra: "opacity-40" },
    { pos: "right-[2%] top-[30%]", size: "h-[380px] w-[380px]", color: "bg-ember", extra: "opacity-30 [animation-direction:alternate-reverse] [animation-duration:24s]" },
    { pos: "left-[35%] top-[65%]", size: "h-[320px] w-[320px]", color: "bg-brass", extra: "opacity-20 [animation-duration:28s]" },
  ];
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {orbs.map((o, i) => (
        <motion.i key={i} className={`orb absolute block ${o.pos}`} style={{ x: springs[i][0], y: springs[i][1] }}>
          <b className={`${o.size} ${o.color} ${o.extra}`} />
        </motion.i>
      ))}
    </div>
  );
}
