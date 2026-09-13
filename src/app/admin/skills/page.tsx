import { getAllUsedSkills, getSkillCategoryMap, DEFAULT_CATEGORY } from "@/lib/skill-categories";
import SkillCategoriesForm from "./SkillCategoriesForm";

export const dynamic = "force-dynamic";

export default async function AdminSkillsPage() {
  const [skills, categoryMap] = await Promise.all([getAllUsedSkills(), getSkillCategoryMap()]);
  const rows = skills.map((skill) => ({ skill, category: categoryMap[skill] ?? DEFAULT_CATEGORY }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
      <h1 className="font-serif text-foreground-bright text-4xl leading-none">Skills &amp; Tools</h1>
      <p className="mt-3 font-mono text-sm text-muted">
        Every skill used across all projects, and which "Skills &amp; Tools" group it shows under on the
        homepage. Uncategorized skills default to Analysis. Add a new skill by typing it into a project's
        Skills field first -- it'll appear here automatically.
      </p>
      <SkillCategoriesForm rows={rows} />
    </div>
  );
}
