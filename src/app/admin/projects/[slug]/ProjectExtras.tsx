"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProjectLink } from "@/lib/projects";
import { Field, inputCls, useSubmit } from "../../_ui";

/** Cover image upload (drop or pick) and add-only links for an existing project. */
export default function ProjectExtras({ slug, imageKey, links }: { slug: string; imageKey: string | null; links: ProjectLink[] }) {
  const router = useRouter();
  const img = useSubmit();
  const link = useSubmit();
  const [preview, setPreview] = useState<string | null>(imageKey ? `/api/files/${imageKey}` : null);
  const [over, setOver] = useState(false);

  async function upload(file: File | undefined) {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    const fd = new FormData();
    fd.append("file", file);
    await img.run(() => fetch(`/api/admin/projects/${slug}/image`, { method: "POST", body: fd }), "Image uploaded.");
    router.refresh();
  }

  async function addLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const ok = await link.run(
      () => fetch(`/api/admin/projects/${slug}/links`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label: fd.get("label"), url: fd.get("url") }) }),
      "Link added.",
    );
    if (ok) {
      form.reset();
      router.refresh();
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="surface p-6">
        <p className="label">Screenshot</p>
        <label
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); upload(e.dataTransfer.files[0]); }}
          className={`mt-4 flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed transition-colors ${over ? "border-ember bg-ember/5" : "border-line hover:border-white/25"}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
          {preview ? <img src={preview} alt="Current screenshot" className="h-full w-full object-cover" /> : <span className="text-sm text-muted">Drop an image or click to choose</span>}
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
        </label>
        <p role="status" className={`mt-3 text-sm ${img.msg?.ok ? "text-brass-soft" : "text-ember-soft"}`}>{img.busy ? "Uploading…" : img.msg?.text}</p>
      </div>

      <div className="surface p-6">
        <p className="label">Links</p>
        <ul className="mt-4 space-y-1 text-sm">
          {links.length === 0 && <li className="text-muted">No links yet.</li>}
          {links.map((l) => (
            <li key={l.url} className="truncate"><span className="text-ink">{l.label}</span> <span className="text-muted">· {l.url}</span></li>
          ))}
        </ul>
        <form onSubmit={addLink} className="mt-5 grid gap-3">
          <Field label="Label"><input name="label" required className={inputCls} placeholder="GitHub" /></Field>
          <Field label="URL"><input name="url" type="url" required className={inputCls} placeholder="https://…" /></Field>
          <div className="flex items-center gap-4">
            <button className="btn py-2" disabled={link.busy}>{link.busy ? "Adding…" : "Add link"}</button>
            <p role="status" className={`text-sm ${link.msg?.ok ? "text-brass-soft" : "text-ember-soft"}`}>{link.msg?.text}</p>
          </div>
        </form>
        <p className="mt-4 text-xs text-muted">Removing or reordering links is still manual SQL (see PROJECTS.md).</p>
      </div>
    </div>
  );
}
