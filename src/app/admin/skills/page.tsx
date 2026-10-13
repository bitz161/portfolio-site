import { getAllUsedSkills, getSkillCategoryMap, DEFAULT_CATEGORY, SKILL_CATEGORIES } from "@/lib/skill-categories";
import SkillBoard from "./SkillBoard";

export const dynamic = "force-dynamic";

export default async function AdminSkills() {
  const [skills, map] = await Promise.all([getAllUsedSkills(), getSkillCategoryMap()]);
  const initial = Object.fromEntries(skills.map((s) => [s, map[s] ?? DEFAULT_CATEGORY]));
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="h-display text-5xl">Skills</h1>
        <p className="max-w-md text-sm text-muted">
          Groups the homepage stack section. Drag a skill to another column, or click it and press “Move here”. Saves instantly.
          New skills come from each project&apos;s Skills field.
        </p>
      </div>
      <div className="mt-8">
        <SkillBoard initial={initial} categories={[...SKILL_CATEGORIES]} />
      </div>
    </>
  );
}
