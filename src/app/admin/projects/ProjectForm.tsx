"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminProject } from "@/lib/admin-projects";
import { slugify } from "@/lib/slug";
import { Field, Section, SubmitBar, inputCls, useSubmit } from "../_ui";

type Mode = { kind: "create" } | { kind: "edit"; project: AdminProject };

export default function ProjectForm({ mode }: { mode: Mode }) {
  const p = mode.kind === "edit" ? mode.project : null;
  const router = useRouter();
  const { busy, msg, run } = useSubmit();
  const [title, setTitle] = useState(p?.title ?? "");
  const [slug, setSlug] = useState(p?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [contentType, setContentType] = useState<"docs" | "notebook" | "code">("docs");
  const [links, setLinks] = useState<{ label: string; url: string }[]>([]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (mode.kind === "create") {
      const data = await run(() => fetch("/api/admin/projects", { method: "POST", body: fd }), "Project created.");
      if (data?.slug) router.push(`/admin/projects/${data.slug}`);
      return;
    }
    const body = {
      title: fd.get("title"),
      track: fd.get("track"),
      progress_status: fd.get("progress_status"),
      visibility: fd.get("visibility"),
      summary: fd.get("summary"),
      description: fd.get("description"),
      skills: String(fd.get("skills") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      details: fd.get("details_markdown"),
      sort_order: Number(fd.get("sort_order") ?? 0),
      metric_before: fd.get("metric_before"),
      metric_after: fd.get("metric_after"),
      metric_label: fd.get("metric_label"),
    };
    await run(
      () => fetch(`/api/admin/projects/${p!.slug}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
      "Saved.",
    );
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Section title="Basics">
        <Field label="Title">
          <input
            name="title"
            required
            className={inputCls}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (mode.kind === "create" && !slugTouched) setSlug(slugify(e.target.value));
            }}
          />
        </Field>
        <Field label="Slug" hint={mode.kind === "edit" ? "Slugs can't change after creation." : "Lowercase letters, numbers, hyphens."}>
          <input
            name="slug"
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            readOnly={mode.kind === "edit"}
            className={`${inputCls} font-mono read-only:opacity-60`}
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
          />
        </Field>
        <Field label="Track">
          <input name="track" required className={inputCls} defaultValue={p?.track ?? "Database Management"} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Progress">
            <select name="progress_status" className={inputCls} defaultValue={p?.status ?? "not-started"}>
              <option value="not-started">Planned</option>
              <option value="in-progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </Field>
          <Field label="Visibility">
            <select name="visibility" className={inputCls} defaultValue={p?.visibility ?? "draft"}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </Field>
        </div>
        <Field label="Summary" hint="One or two sentences for cards. Max 500 characters." wide>
          <textarea name="summary" required maxLength={500} rows={2} className={inputCls} defaultValue={p?.summary} />
        </Field>
        <Field label="Description" hint="Lead paragraph on the project page." wide>
          <textarea name="description" required rows={3} className={inputCls} defaultValue={p?.description} />
        </Field>
        <Field label="Skills" hint="Comma-separated." wide>
          <input name="skills" className={inputCls} defaultValue={p?.skills.join(", ")} placeholder="MySQL, ProxySQL, Orchestrator" />
        </Field>
        {p && (
          <Field label="Sort order" hint="Lower comes first.">
            <input name="sort_order" type="number" className={inputCls} defaultValue={p.sortOrder} />
          </Field>
        )}
      </Section>

      {p && (
        <Section title="Before / after metric (optional)">
          <Field label="Before"><input name="metric_before" className={inputCls} defaultValue={p.metricBefore ?? ""} placeholder="26.8ms" /></Field>
          <Field label="After"><input name="metric_after" className={inputCls} defaultValue={p.metricAfter ?? ""} placeholder="1.6ms" /></Field>
          <Field label="Label" wide><input name="metric_label" className={inputCls} defaultValue={p.metricLabel ?? ""} placeholder="Query time after composite index" /></Field>
        </Section>
      )}

      <Section title="Write-up">
        {mode.kind === "create" && (
          <Field label="Content type" wide>
            <div className="flex flex-wrap gap-2">
              {(["docs", "notebook", "code"] as const).map((t) => (
                <label key={t} className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors ${contentType === t ? "border-ink bg-ink text-bg" : "border-line text-muted hover:text-ink"}`}>
                  <input type="radio" name="content_type" value={t} checked={contentType === t} onChange={() => setContentType(t)} className="sr-only" />
                  {t === "docs" ? "Markdown" : t === "notebook" ? "Jupyter notebook" : "Code snippet"}
                </label>
              ))}
            </div>
          </Field>
        )}
        {(mode.kind === "edit" || contentType === "docs") && (
          <Field label="Markdown" wide>
            <textarea name="details_markdown" rows={18} className={`${inputCls} font-mono text-xs leading-relaxed`} defaultValue={p?.details ?? ""} />
          </Field>
        )}
        {mode.kind === "create" && contentType === "notebook" && (
          <Field label=".ipynb file" hint="Converted to Markdown; output images go to MinIO. Max 10 MB." wide>
            <input name="file" type="file" accept=".ipynb" required className={inputCls} />
          </Field>
        )}
        {mode.kind === "create" && contentType === "code" && (
          <>
            <Field label="Language"><input name="code_language" className={inputCls} placeholder="sql" /></Field>
            <Field label="Or upload a file"><input name="file" type="file" className={inputCls} /></Field>
            <Field label="Code" wide><textarea name="code_source" rows={12} className={`${inputCls} font-mono text-xs`} /></Field>
          </>
        )}
      </Section>

      {mode.kind === "create" && (
        <Section title="Links (optional)">
          <div className="space-y-3 sm:col-span-2">
            {links.map((l, i) => (
              <div key={i} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
                <input name="link_label" placeholder="GitHub" className={inputCls} value={l.label} onChange={(e) => setLinks(links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                <input name="link_url" type="url" placeholder="https://…" className={inputCls} value={l.url} onChange={(e) => setLinks(links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
                <button type="button" onClick={() => setLinks(links.filter((_, j) => j !== i))} className="btn-ghost py-2">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => setLinks([...links, { label: "", url: "" }])} className="btn-ghost py-2">+ Add link</button>
          </div>
        </Section>
      )}

      <SubmitBar busy={busy} msg={msg} label={mode.kind === "create" ? "Create project" : "Save changes"} />
    </form>
  );
}
