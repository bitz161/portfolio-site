import { getAllUsedSkills, getSkillCategoryMap, DEFAULT_CATEGORY, SKILL_CATEGORIES } from "@/lib/skill-categories";
import SkillRow from "./SkillRow";

export const dynamic = "force-dynamic";

export default async function AdminSkills() {
  const [skills, map] = await Promise.all([getAllUsedSkills(), getSkillCategoryMap()]);
  return (
    <>
      <h1 className="h-display text-5xl">Skills</h1>
      <p className="mt-3 max-w-xl text-muted">Groups the homepage stack section. Changes save as soon as you pick a category.</p>
      <ul className="surface mt-8 divide-y divide-line">
        {skills.map((s) => (
          <SkillRow key={s} skill={s} category={map[s] ?? DEFAULT_CATEGORY} categories={[...SKILL_CATEGORIES]} />
        ))}
      </ul>
    </>
  );
}
