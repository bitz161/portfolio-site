"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";

const COLORS = ["#fcf1d0", "#b9bfd0", "#22396f", "#ffffff"];

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

const out = { target: "_blank", rel: "noopener noreferrer" };

/** Contact set as full-width display rows: the address copies itself, the rest are links. */
export default function ContactRows() {
  const [done, setDone] = useState(false);

  async function copy(e: React.MouseEvent<HTMLButtonElement>) {
    try {
      await navigator.clipboard.writeText(SITE.email);
    } catch {
      location.href = `mailto:${SITE.email}`;
      return;
    }
    setDone(true);
    burst(e.clientX, e.clientY);
    setTimeout(() => setDone(false), 2400);
  }

  return (
    <div className="rows">
      <button className="mail" onClick={copy} title="Copy the address">
        <span aria-live="polite">{done ? "Copied to your clipboard" : SITE.email}</span>
      </button>
      <a href="/Josue_Garcia_CV_DBA.pdf" download>
        CV, database administrator
      </a>
      <a href="/Josue_Garcia_CV_IT_Support.pdf" download>
        CV, IT support
      </a>
      <a href={SITE.linkedin} {...out}>
        LinkedIn
      </a>
      <a href={SITE.github} {...out}>
        GitHub
      </a>
      <a href={SITE.statusPage} {...out}>
        Status page
      </a>
      <a className="hello" href={`mailto:${SITE.email}?subject=Hello%20Josue`} aria-label="Say hello by email">
        Hello
        <i aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="square"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </i>
      </a>
    </div>
  );
}
