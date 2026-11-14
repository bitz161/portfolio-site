import type { Project } from "@/lib/projects";
import type { GridProject } from "@/components/projects/ProjectGrid";
import { UNCATEGORIZED } from "@/lib/skill-categories";

export const toGrid = (p: Project): GridProject => ({
  slug: p.slug,
  title: p.title,
  summary: p.summary,
  status: p.status,
  skills: p.skills ?? [],
  updated: p.updatedAt.toLocaleDateString("en-US", { year: "numeric", month: "short" }),
});

/** Skills grouped by their admin board column, in board order. Unplaced skills show last as "Other". */
export function skillGroups(projects: Project[], categoryMap: Record<string, string>, groups: string[]) {
  const all = [...new Set(projects.flatMap((p) => p.skills ?? []))];
  const colOf = (s: string) => (groups.includes(categoryMap[s]) ? categoryMap[s] : UNCATEGORIZED);
  return [...groups.filter((g) => g !== UNCATEGORIZED), UNCATEGORIZED]
    .map((g) => ({ category: g === UNCATEGORIZED ? "Other" : g, skills: all.filter((s) => colOf(s) === g) }))
    .filter((g) => g.skills.length > 0);
}

/** The tools used in the most projects, most used first: [name, number of projects]. */
export function topSkills(projects: Project[], n: number): [string, number][] {
  const count = new Map<string, number>();
  for (const p of projects) for (const s of p.skills ?? []) count.set(s, (count.get(s) ?? 0) + 1);
  return [...count].sort((a, b) => b[1] - a[1]).slice(0, n);
}
