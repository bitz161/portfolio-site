import type { ProjectStatus } from "@/lib/projects";

export const SITE = {
  name: "Josue Garcia",
  role: "Database administrator → data engineer",
  email: "josuegarciaii@yahoo.com",
  linkedin: "https://www.linkedin.com/in/josue-garcia-47597b180",
  github: "https://github.com/bitz161",
  repo: "https://github.com/bitz161/portfolio-site",
  statusPage: "https://bitz161.github.io/portfolio-status/",
};

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  done: "Done",
  "in-progress": "In progress",
  "not-started": "Planned",
};

const ACCENTS = ["var(--color-steel)", "var(--color-ember)", "var(--color-brass)"] as const;

/** Stable accent per slug, so a project keeps its color on every page. */
export function accentOf(slug: string) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return ACCENTS[h % ACCENTS.length];
}

export function formatDate(d: Date | null) {
  return d ? d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "";
}

/** "26.8ms" / "1.6ms" -> 16.75, or null when either side isn't numeric. */
export function speedup(before: string, after: string) {
  const b = parseFloat(before);
  const a = parseFloat(after);
  return Number.isFinite(b) && Number.isFinite(a) && a > 0 ? b / a : null;
}
