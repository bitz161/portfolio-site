import type { Project } from "@/lib/projects";
import { accentOf } from "@/lib/site";
import type { GridProject } from "@/components/projects/ProjectGrid";
import { UNCATEGORIZED } from "@/lib/skill-categories";

export const toGrid = (p: Project): GridProject => ({
  slug: p.slug,
  title: p.title,
  summary: p.summary,
  status: p.status,
  skills: p.skills ?? [],
  accent: accentOf(p.slug),
});

/** Skills grouped by their admin board column, in board order. Unplaced skills show last as "Other". */
export function skillGroups(projects: Project[], categoryMap: Record<string, string>, groups: string[]) {
  const all = [...new Set(projects.flatMap((p) => p.skills ?? []))];
  const colOf = (s: string) => (groups.includes(categoryMap[s]) ? categoryMap[s] : UNCATEGORIZED);
  return [...groups.filter((g) => g !== UNCATEGORIZED), UNCATEGORIZED]
    .map((g) => ({ category: g === UNCATEGORIZED ? "Other" : g, skills: all.filter((s) => colOf(s) === g) }))
    .filter((g) => g.skills.length > 0);
}
