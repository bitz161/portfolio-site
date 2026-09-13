import type { RowDataPacket } from "mysql2";
import { getPool, getAdminPool } from "@/lib/db";

export const SKILL_CATEGORIES = ["Languages", "Databases", "Data Eng", "Infra", "Analysis"] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];
const DEFAULT_CATEGORY: SkillCategory = "Analysis";

type SkillCategoryRow = RowDataPacket & { skill: string; category: string };

/** skill -> category, for every skill that's been explicitly categorized. Anything not in here falls back to "Analysis". */
export async function getSkillCategoryMap(): Promise<Record<string, string>> {
  const [rows] = await getPool().query<SkillCategoryRow[]>(`SELECT skill, category FROM skill_categories`);
  return Object.fromEntries(rows.map((r) => [r.skill, r.category]));
}

type ProjectSkillsRow = RowDataPacket & { skills: string[] };

/** Every distinct skill string used across all projects (all visibilities -- admin view). */
export async function getAllUsedSkills(): Promise<string[]> {
  const [rows] = await getAdminPool().query<ProjectSkillsRow[]>(`SELECT skills FROM projects`);
  const all = new Set<string>();
  for (const row of rows) for (const s of row.skills ?? []) all.add(s);
  return [...all].sort((a, b) => a.localeCompare(b));
}

export async function setSkillCategory(skill: string, category: string) {
  if (!SKILL_CATEGORIES.includes(category as SkillCategory)) {
    throw new Error(`Invalid category: ${category}`);
  }
  await getAdminPool().query(
    `INSERT INTO skill_categories (skill, category) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE category = VALUES(category)`,
    [skill, category],
  );
}

export { DEFAULT_CATEGORY };
