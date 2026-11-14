"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, MotionConfig, useInView, useScroll, useSpring, useTransform } from "motion/react";

export const EMPH = [0.05, 0.7, 0.1, 1] as const;

/** App-wide: honor the OS reduce-motion setting (transforms off, opacity fades stay). */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** Fades + rises into view once. `i` staggers siblings by 80 ms. */
export function Reveal({ children, i = 0, className }: { children: ReactNode; i?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, ease: EMPH, delay: i * 0.08 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Sets a line letter by letter: each glyph swings up from below its own baseline, in order.
 * Words stay unbreakable so wrapping is the same as plain text. Once the last glyph has landed the
 * line goes back to being plain text, so it selects, wraps and reads aloud like any other.
 */
export function Letters({ text, step = 0.028, delay = 0, onLoad = false }: { text: string; step?: number; delay?: number; onLoad?: boolean }) {
  const [done, setDone] = useState(false);
  if (done) return <>{text}</>;
  const last = [...text.replace(/ /g, "")].length - 1;
  let n = 0;
  return (
    <motion.span aria-label={text} initial="hide" {...(onLoad ? { animate: "show" } : { whileInView: "show", viewport: { once: true, amount: 0.5 } })}>
      {text.split(" ").map((word, w) => (
        <span key={w} aria-hidden>
          {w > 0 && " "}
          <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {[...word].map((ch) => {
              const i = n++;
              return (
                <motion.span
                  key={i}
                  style={{ display: "inline-block", transformOrigin: "0 100%" }}
                  variants={{ hide: { y: "0.55em", opacity: 0, rotate: 7 }, show: { y: 0, opacity: 1, rotate: 0, transition: { duration: 0.9, ease: EMPH, delay: delay + i * step } } }}
                  onAnimationComplete={i === last ? (v) => v === "show" && setDone(true) : undefined}
                >
                  {ch}
                </motion.span>
              );
            })}
          </span>
        </span>
      ))}
    </motion.span>
  );
}

/** A list whose children arrive one after another when it scrolls into view. Renders the given tag. */
export function Stagger({ children, className, as = "ul", gap = 0.06 }: { children: ReactNode; className?: string; as?: "ul" | "ol" | "div"; gap?: number }) {
  const Tag = motion[as];
  return (
    <Tag className={className} initial="hide" whileInView="show" viewport={{ once: true, amount: 0.1 }} variants={{ show: { transition: { staggerChildren: gap } } }}>
      {children}
    </Tag>
  );
}
export function StaggerItem({ children, className, as = "li", from = "below" }: { children: ReactNode; className?: string; as?: "li" | "div"; from?: "below" | "left" }) {
  const Tag = motion[as];
  const hide = from === "left" ? { opacity: 0, x: -48 } : { opacity: 0, y: 28 };
  return (
    <Tag className={className} variants={{ hide, show: { opacity: 1, x: 0, y: 0, transition: { duration: 0.8, ease: EMPH } } }}>
      {children}
    </Tag>
  );
}

/** A figure that counts up to its value once, when seen. Server render and no-script show the final value. */
export function CountUp({ to, decimals = 0 }: { to: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  useEffect(() => {
    if (!inView || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = animate(0, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => ref.current && (ref.current.textContent = v.toFixed(decimals)) });
    return () => c.stop();
  }, [inView, to, decimals]);
  return <span ref={ref}>{to.toFixed(decimals)}</span>;
}

/** Moves its child slower than the page while it crosses the screen (a few percent of travel). */
export function Drift({ children, className, travel = 40 }: { children: ReactNode; className?: string; travel?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [travel, -travel]), { stiffness: 120, damping: 24 });
  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}
