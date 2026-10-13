"use client";

import { useState } from "react";
import { LayoutGroup, motion } from "motion/react";

type Props = { initial: Record<string, string>; categories: string[] };

/**
 * One column per category, skills as chips. Drag a chip to another column, or click it
 * and then "Move here" (keyboard/touch). Moves are optimistic and roll back on error.
 */
export default function SkillBoard({ initial, categories }: Props) {
  const [map, setMap] = useState(initial);
  const [picked, setPicked] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  async function move(skill: string, category: string) {
    const prev = map[skill];
    setPicked(null);
    setOver(null);
    if (prev === category) return;
    setMap((m) => ({ ...m, [skill]: category }));
    const res = await fetch("/api/admin/skill-categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skill, category }),
    }).catch(() => null);
    if (res?.ok) setStatus({ ok: true, text: `${skill} → ${category}` });
    else {
      setMap((m) => ({ ...m, [skill]: prev }));
      setStatus({ ok: false, text: `Couldn't move ${skill}. Try again.` });
    }
  }

  const skills = Object.keys(map).sort((a, b) => a.localeCompare(b));

  return (
    <>
      <p role="status" className={`mb-4 h-5 text-sm ${status?.ok ? "text-brass-soft" : "text-ember-soft"}`}>
        {picked ? `Moving “${picked}”: pick a column, or click it again to cancel.` : status?.text}
      </p>
      <LayoutGroup>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.map((cat) => {
            const items = skills.filter((s) => map[s] === cat);
            const target = picked && map[picked] !== cat;
            return (
              <section
                key={cat}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOver(cat);
                }}
                onDragLeave={() => setOver((o) => (o === cat ? null : o))}
                onDrop={(e) => {
                  e.preventDefault();
                  const skill = e.dataTransfer.getData("text/plain");
                  if (skill) move(skill, cat);
                }}
                className={`surface flex min-h-40 flex-col p-4 transition-colors duration-200 ${over === cat ? "border-ember/60 bg-ember/5" : ""}`}
              >
                <header className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="label">{cat}</h2>
                  {target ? (
                    <button onClick={() => move(picked!, cat)} className="rounded-full bg-ember px-2.5 py-0.5 text-xs font-medium text-bg">
                      Move here
                    </button>
                  ) : (
                    <span className="font-mono text-xs text-muted">{items.length}</span>
                  )}
                </header>
                <ul className="flex flex-wrap content-start gap-1.5">
                  {items.map((s) => (
                    <motion.li key={s} layout layoutId={`skill-${s}`} transition={{ type: "spring", stiffness: 420, damping: 34 }}>
                      <button
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", s);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragEnd={() => setOver(null)}
                        onClick={() => setPicked((p) => (p === s ? null : s))}
                        aria-pressed={picked === s}
                        className={`cursor-grab rounded-full border px-3 py-1 text-sm transition-colors active:cursor-grabbing ${picked === s ? "border-ember bg-ember/15 text-ink" : "border-line bg-white/[0.03] text-ink/90 hover:border-white/25"}`}
                      >
                        {s}
                      </button>
                    </motion.li>
                  ))}
                  {items.length === 0 && <li className="text-sm text-muted">Drop skills here</li>}
                </ul>
              </section>
            );
          })}
        </div>
      </LayoutGroup>
    </>
  );
}
