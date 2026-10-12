"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EMPH } from "@/components/motion/primitives";

const COLORS = ["#4f7fa8", "#e2703a", "#c9a24a", "#ecebe8"];

/** One-shot confetti on a throwaway full-screen canvas. */
function burst(x: number, y: number) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = document.createElement("canvas");
  const dpr = devicePixelRatio || 1;
  c.width = innerWidth * dpr;
  c.height = innerHeight * dpr;
  c.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:70";
  document.body.append(c);
  const ctx = c.getContext("2d")!;
  ctx.scale(dpr, dpr);
  const parts = Array.from({ length: 110 }, (_, i) => {
    const a = Math.random() * Math.PI * 2;
    const s = 250 + Math.random() * 700;
    return { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 350, r: Math.random() * 6, vr: (Math.random() - 0.5) * 14, w: 4 + Math.random() * 6, h: 7 + Math.random() * 9, c: COLORS[i % 4], life: 1 };
  });
  let last = performance.now();
  const tick = (now: number) => {
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    let alive = 0;
    for (const p of parts) {
      if ((p.life -= dt * 0.6) <= 0) continue;
      alive++;
      p.vx *= 0.985;
      p.vy = p.vy * 0.985 + 1500 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.r += p.vr * dt;
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.life * 2);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (alive) requestAnimationFrame(tick);
    else c.remove();
  };
  requestAnimationFrame(tick);
}

export default function CopyEmail({ email }: { email: string }) {
  const [done, setDone] = useState(false);

  async function copy(e: React.MouseEvent<HTMLButtonElement>) {
    if (done) return;
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      location.href = `mailto:${email}`;
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    setDone(true);
    burst(r.left + r.width / 2, r.top + r.height / 2);
    setTimeout(() => setDone(false), 2400);
  }

  return (
    <div className="flex items-center gap-4">
      <motion.button
        onClick={copy}
        layout
        transition={{ layout: { duration: 0.5, ease: EMPH } }}
        className={`relative flex h-14 items-center justify-center overflow-hidden rounded-full font-medium text-bg ${done ? "w-14 bg-brass" : "bg-ink px-7"}`}
        aria-label={done ? "Email copied" : `Copy email address ${email}`}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {done ? (
            <motion.svg key="ok" viewBox="0 0 26 26" className="h-6 w-6" initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 14 }}>
              <motion.path d="M6 13.5l4.5 4.5L20 8" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.38, delay: 0.12 }} />
            </motion.svg>
          ) : (
            <motion.span key="lbl" className="whitespace-nowrap" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}>
              Copy email
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
      <span aria-live="polite" className="font-mono text-sm text-muted">{done ? "Copied to clipboard" : email}</span>
    </div>
  );
}
