import type { RowDataPacket } from "mysql2";
import { getPool, getAdminPool } from "@/lib/db";

/** Protected first column: new skills land here; it can't be renamed or deleted. */
export const UNCATEGORIZED = "Uncategorized";

type GroupRow = RowDataPacket & { name: string };

/** Column names in display order (schema_skill_groups.sql). */
export async function getSkillGroups(): Promise<string[]> {
  const [rows] = await getPool().query<GroupRow[]>(`SELECT name FROM skill_groups ORDER BY sort_order, name`);
  return rows.map((r) => r.name);
}

type SkillCategoryRow = RowDataPacket & { skill: string; category: string };

/** skill -> column, for every skill that's been placed. Anything missing is Uncategorized. */
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

/** mysql2 error code check without importing its error type. */
const isCode = (err: unknown, code: string) => (err as { code?: string })?.code === code;

export async function setSkillCategory(skill: string, category: string) {
  try {
    await getAdminPool().query(
      `INSERT INTO skill_categories (skill, category) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE category = VALUES(category)`,
      [skill, category],
    );
  } catch (err) {
    // fk_skill_categories_group: the column doesn't exist
    if (isCode(err, "ER_NO_REFERENCED_ROW_2")) throw new Error(`No column named "${category}".`);
    throw err;
  }
}

const cleanName = (name: string) => {
  const n = name.trim().replace(/\s+/g, " ");
  if (!n || n.length > 40) throw new Error("Column names must be 1-40 characters.");
  return n;
};

export async function addSkillGroup(name: string) {
  const n = cleanName(name);
  try {
    await getAdminPool().query(
      `INSERT INTO skill_groups (name, sort_order) SELECT ?, COALESCE(MAX(sort_order), 0) + 10 FROM skill_groups`,
      [n],
    );
  } catch (err) {
    if (isCode(err, "ER_DUP_ENTRY")) throw new Error(`A column named "${n}" already exists.`);
    throw err;
  }
  return n;
}

/** Renames cascade to every skill in the column via the foreign key. */
export async function renameSkillGroup(from: string, to: string) {
  if (from === UNCATEGORIZED) throw new Error(`"${UNCATEGORIZED}" can't be renamed.`);
  const n = cleanName(to);
  try {
    const [res] = await getAdminPool().query(`UPDATE skill_groups SET name = ? WHERE name = ?`, [n, from]);
    if ((res as { affectedRows: number }).affectedRows === 0) throw new Error(`No column named "${from}".`);
  } catch (err) {
    if (isCode(err, "ER_DUP_ENTRY")) throw new Error(`A column named "${n}" already exists.`);
    throw err;
  }
  return n;
}

/** Only empty columns can go; the foreign key refuses otherwise. */
export async function deleteSkillGroup(name: string) {
  if (name === UNCATEGORIZED) throw new Error(`"${UNCATEGORIZED}" can't be deleted.`);
  try {
    await getAdminPool().query(`DELETE FROM skill_groups WHERE name = ?`, [name]);
  } catch (err) {
    if (isCode(err, "ER_ROW_IS_REFERENCED_2")) throw new Error(`Move the skills out of "${name}" first.`);
    throw err;
  }
}
