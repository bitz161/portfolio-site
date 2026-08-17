"use client";

import { useState } from "react";
import type { AdminProject } from "@/lib/admin-projects";

export default function EditProjectForm({ project }: { project: AdminProject }) {
  const [title, setTitle] = useState(project.title);
  const [track, setTrack] = useState(project.track);
  const [progressStatus, setProgressStatus] = useState(project.status);
  const [visibility, setVisibility] = useState(project.visibility);
  const [summary, setSummary] = useState(project.summary);
  const [description, setDescription] = useState(project.description);
  const [skills, setSkills] = useState(project.skills.join(", "));
  const [details, setDetails] = useState(project.details ?? "");
  const [sortOrder, setSortOrder] = useState(project.sortOrder);
  const [links, setLinks] = useState(project.links);
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [savingLink, setSavingLink] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/projects/${project.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          track,
          progress_status: progressStatus,
          visibility,
          summary,
          description,
          skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
          details,
          sort_order: sortOrder,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save changes.");
      setResult({ ok: true, message: "Saved." });
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault();
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
    setSavingLink(true);
    try {
      const res = await fetch(`/api/admin/projects/${project.slug}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLinkLabel, url: newLinkUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add link.");
      setLinks((prev) => [...prev, { label: newLinkLabel, url: newLinkUrl }]);
      setNewLinkLabel("");
      setNewLinkUrl("");
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setSavingLink(false);
    }
  }

  const inputClass =
    "mt-1 w-full border-2 border-border-soft bg-card px-3 py-2 text-foreground focus:outline-none focus:shadow-[3px_3px_0_#000]";

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-foreground-bright">Title</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground-bright">Track</label>
            <input required value={track} onChange={(e) => setTrack(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground-bright">Sort order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground-bright">Progress</label>
            <select
              value={progressStatus}
              onChange={(e) => setProgressStatus(e.target.value as typeof progressStatus)}
              className={inputClass}
            >
              <option value="not-started">Not started</option>
              <option value="in-progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground-bright">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as typeof visibility)}
              className={inputClass}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground-bright">Summary</label>
          <textarea
            required
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            maxLength={500}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground-bright">Description</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground-bright">Skills (comma-separated)</label>
          <input value={skills} onChange={(e) => setSkills(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground-bright">Writeup (Markdown)</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={14}
            className={`${inputClass} font-mono text-sm`}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="card-brutal-sm w-full bg-accent-lime px-4 py-3 font-bold text-foreground uppercase tracking-wide transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Save Changes"}
        </button>

        {result && (
          <p className={result.ok ? "text-sm font-bold text-accent-teal" : "text-sm font-bold text-accent-danger"}>
            {result.message}
            {result.ok && (
              <>
                {" "}
                <a href={`/projects/${project.slug}`} className="underline underline-offset-4">
                  View it →
                </a>
              </>
            )}
          </p>
        )}
      </form>

      <div className="mt-12 border-t-2 border-border-soft pt-8">
        <h2 className="font-serif text-2xl text-foreground-bright">Links</h2>
        <p className="mt-1 text-sm text-muted">
          Removing or reordering an existing link is still manual SQL (PROJECTS.md) — this only adds new ones.
        </p>
        <ul className="mt-4 space-y-2">
          {links.map((l, i) => (
            <li key={i} className="chip-brutal inline-block mr-2">
              {l.label}
            </li>
          ))}
          {links.length === 0 && <p className="text-sm text-muted">No links yet.</p>}
        </ul>
        <form onSubmit={handleAddLink} className="mt-4 flex gap-2">
          <input
            value={newLinkLabel}
            onChange={(e) => setNewLinkLabel(e.target.value)}
            placeholder="GitHub"
            className="w-1/3 border-2 border-border-soft bg-card px-3 py-2 text-foreground focus:outline-none focus:shadow-[3px_3px_0_#000]"
          />
          <input
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            placeholder="https://github.com/you/repo"
            className="flex-1 border-2 border-border-soft bg-card px-3 py-2 text-foreground focus:outline-none focus:shadow-[3px_3px_0_#000]"
          />
          <button
            type="submit"
            disabled={savingLink}
            className="card-brutal-sm bg-accent-lime px-4 py-2 font-bold text-foreground disabled:opacity-50"
          >
            {savingLink ? "…" : "Add"}
          </button>
        </form>
      </div>
    </>
  );
}
