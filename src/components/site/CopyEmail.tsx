"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EMPH } from "@/components/motion/primitives";
import { ActionChip } from "@/components/site/ActionLink";

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
    // read before awaiting: React clears e.currentTarget once the handler yields
    const r = e.currentTarget.getBoundingClientRect();
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      location.href = `mailto:${email}`;
      return;
    }
    setDone(true);
    burst(r.left + r.width / 2, r.top + r.height / 2);
    setTimeout(() => setDone(false), 2400);
  }

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <button
        onClick={copy}
        className="act"
        style={done ? ({ "--chip-bg": "var(--color-brass)", "--chip-fg": "var(--color-bg)" } as React.CSSProperties) : undefined}
        aria-label={done ? "Email copied" : `Copy email address ${email}`}
      >
        <span className="act-label relative inline-grid overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={done ? "done" : "idle"}
              className="whitespace-nowrap"
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              exit={{ y: "-110%" }}
              transition={{ duration: 0.45, ease: EMPH }}
            >
              {done ? "Copied" : "Copy email"}
            </motion.span>
          </AnimatePresence>
        </span>
        {done ? (
          <span className="act-chip">
            <motion.svg viewBox="0 0 24 24" className="h-[1.1rem] w-[1.1rem]" initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 420, damping: 14 }}>
              <motion.path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.38, delay: 0.1 }} />
            </motion.svg>
          </span>
        ) : (
          <ActionChip icon="mail" />
        )}
      </button>
      <span aria-live="polite" className="font-mono text-sm text-muted">{done ? "In your clipboard" : email}</span>
    </div>
  );
}
