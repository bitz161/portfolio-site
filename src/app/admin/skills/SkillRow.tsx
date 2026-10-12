"use client";

import { inputCls, useSubmit } from "../_ui";

export default function SkillRow({ skill, category, categories }: { skill: string; category: string; categories: string[] }) {
  const { busy, msg, run } = useSubmit();
  return (
    <li className="flex flex-wrap items-center gap-4 px-5 py-3">
      <span className="flex-1 text-sm">{skill}</span>
      <span role="status" className={`text-xs ${msg?.ok ? "text-brass-soft" : "text-ember-soft"}`}>{busy ? "Saving…" : msg?.text}</span>
      <select
        aria-label={`Category for ${skill}`}
        defaultValue={category}
        className={`${inputCls} w-44`}
        onChange={(e) =>
          run(
            () => fetch("/api/admin/skill-categories", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ skill, category: e.target.value }) }),
            "Saved",
          )
        }
      >
        {categories.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
    </li>
  );
}
