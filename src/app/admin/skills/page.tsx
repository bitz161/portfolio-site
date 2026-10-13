import { getAllUsedSkills, getSkillCategoryMap, getSkillGroups, UNCATEGORIZED } from "@/lib/skill-categories";
import SkillBoard from "./SkillBoard";

export const dynamic = "force-dynamic";

export default async function AdminSkills() {
  const [skills, map, groups] = await Promise.all([getAllUsedSkills(), getSkillCategoryMap(), getSkillGroups()]);
  // a skill with no placement, or placed in a column that no longer exists, shows as Uncategorized
  const initial = Object.fromEntries(skills.map((s) => [s, groups.includes(map[s]) ? map[s] : UNCATEGORIZED]));
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="h-display text-5xl">Skills</h1>
        <p className="max-w-md text-sm text-muted">
          Groups the homepage stack section. Skills come from each project&apos;s Skills field and land in Uncategorized.
          Drag them into a column, or click one and press “Move here”. Click a column title to rename it; empty columns can be deleted.
        </p>
      </div>
      <div className="mt-8">
        <SkillBoard initial={initial} groups={groups} uncategorized={UNCATEGORIZED} />
      </div>
    </>
  );
}
