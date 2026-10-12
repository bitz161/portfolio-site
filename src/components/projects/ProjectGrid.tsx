"use client";

import Link from "next/link";
import { useState, ViewTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { ProjectStatus } from "@/lib/projects";
import { STATUS_LABEL } from "@/lib/site";
import { EMPH } from "@/components/motion/primitives";
import StatusBadge from "./StatusBadge";

export type GridProject = {
  slug: string;
  title: string;
  summary: string;
  status: ProjectStatus;
  skills: string[];
  accent: string;
};

const FILTERS: (ProjectStatus | "all")[] = ["all", "done", "in-progress", "not-started"];

export default function ProjectGrid({ projects }: { projects: GridProject[] }) {
  const [filter, setFilter] = useState<ProjectStatus | "all">("all");
  const shown = projects.filter((p) => filter === "all" || p.status === filter);
  const count = (f: ProjectStatus | "all") => projects.filter((p) => f === "all" || p.status === f).length;

  return (
    <div>
      <div role="group" aria-label="Filter projects by status" className="mb-6 flex flex-wrap gap-2">
        {FILTERS.filter((f) => count(f) > 0).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`relative rounded-full border px-4 py-2 text-sm transition-[color,border-color,transform] duration-150 ease-std active:scale-95 ${filter === f ? "border-ink text-bg" : "border-line text-muted hover:border-white/25 hover:text-ink"}`}
          >
            {filter === f && (
              <motion.span
                layoutId="filter-pill"
                className="absolute inset-0 -z-10 rounded-full bg-ink"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            {f === "all" ? "All" : STATUS_LABEL[f]}
            <span className="ml-2 font-mono text-xs opacity-60">{count(f)}</span>
          </button>
        ))}
      </div>

      <motion.ul layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((p, i) => (
            <motion.li
              key={p.slug}
              layout
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.55, ease: EMPH, delay: i * 0.03 } }}
              exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.2, ease: [0.3, 0, 1, 1] } }}
              transition={{ layout: { duration: 0.65, ease: EMPH } }}
            >
              <ProjectTile p={p} index={projects.indexOf(p)} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}

function ProjectTile({ p, index }: { p: GridProject; index: number }) {
  return (
    <Link href={`/projects/${p.slug}`} prefetch className="group block h-full">
      <ViewTransition name={`project-${p.slug}`} share="morph" default="none">
        <article
          className="surface relative flex h-full flex-col overflow-hidden p-6 transition-[border-color,transform] duration-300 ease-std group-hover:-translate-y-1 group-hover:border-white/20"
          style={{ background: `linear-gradient(160deg, color-mix(in srgb, ${p.accent} 18%, transparent), rgb(255 255 255 / 0.02) 60%)` }}
        >
          <div className="flex items-start justify-between">
            <span className="font-display text-5xl leading-none text-white/15">{String(index + 1).padStart(2, "0")}</span>
            <StatusBadge status={p.status} />
          </div>
          <h3 className="mt-10 font-display text-2xl leading-tight">{p.title}</h3>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{p.summary}</p>
          <div className="mt-auto flex items-end justify-between gap-4 pt-6">
            <div className="flex flex-wrap gap-1.5">
              {p.skills.slice(0, 3).map((s) => (
                <span key={s} className="chip">{s}</span>
              ))}
            </div>
            <span aria-hidden className="text-xl text-muted transition-transform duration-300 ease-std group-hover:translate-x-1 group-hover:text-ink">→</span>
          </div>
        </article>
      </ViewTransition>
    </Link>
  );
}
