import type { Project } from "@/lib/projects";
import { accentOf } from "@/lib/site";
import type { GridProject } from "@/components/projects/ProjectGrid";
import { DEFAULT_CATEGORY, SKILL_CATEGORIES } from "@/lib/skill-categories";

export const toGrid = (p: Project): GridProject => ({
  slug: p.slug,
  title: p.title,
  summary: p.summary,
  status: p.status,
  skills: p.skills ?? [],
  accent: accentOf(p.slug),
});

/** Every distinct skill grouped by its admin-set category; uncategorized ones land in the default. */
export function skillGroups(projects: Project[], categoryMap: Record<string, string>) {
  const all = [...new Set(projects.flatMap((p) => p.skills ?? []))];
  return SKILL_CATEGORIES.map((category) => ({
    category,
    skills: all.filter((s) => (categoryMap[s] ?? DEFAULT_CATEGORY) === category),
  })).filter((g) => g.skills.length > 0);
}
