"use client";

import { useState } from "react";

const CATEGORIES = ["Languages", "Databases", "Data Eng", "Infra", "Analysis"];

type Row = { skill: string; category: string };

export default function SkillCategoriesForm({ rows }: { rows: Row[] }) {
  const [categories, setCategories] = useState<Record<string, string>>(
    Object.fromEntries(rows.map((r) => [r.skill, r.category])),
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  async function handleChange(skill: string, category: string) {
    setCategories((c) => ({ ...c, [skill]: category }));
    setSaving(skill);
    setSaved(null);
    try {
      const res = await fetch("/api/admin/skill-categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill, category }),
      });
      if (!res.ok) throw new Error();
      setSaved(skill);
    } catch {
      // best-effort UI; the dropdown already reflects the attempted value
    } finally {
      setSaving(null);
    }
  }

  if (rows.length === 0) {
    return <p className="mt-8 font-mono text-sm text-muted">No skills found on any project yet.</p>;
  }

  return (
    <div className="mt-8 border-2 border-foreground-bright">
      {rows.map(({ skill }, i) => (
        <div
          key={skill}
          className={`flex items-center justify-between gap-4 px-4 py-3 ${i > 0 ? "border-t border-foreground-bright/20" : ""}`}
        >
          <span className="font-mono text-sm text-foreground-bright">{skill}</span>
          <div className="flex items-center gap-3">
            {saving === skill && <span className="font-mono text-[11px] text-muted">Saving…</span>}
            {saved === skill && <span className="font-mono text-[11px] text-accent">Saved</span>}
            <select
              value={categories[skill]}
              onChange={(e) => handleChange(skill, e.target.value)}
              className="border border-foreground-bright bg-background px-2 py-1 font-mono text-xs"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
