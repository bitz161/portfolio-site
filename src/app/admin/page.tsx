"use client";

import { useState } from "react";

type ContentType = "docs" | "notebook" | "code";

const CODE_LANGUAGES = ["sql", "python", "bash", "javascript", "typescript", "r"];

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [track, setTrack] = useState("");
  const [progressStatus, setProgressStatus] = useState("not-started");
  const [visibility, setVisibility] = useState("draft");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [contentType, setContentType] = useState<ContentType>("docs");
  const [detailsMarkdown, setDetailsMarkdown] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("sql");
  const [codeSource, setCodeSource] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [links, setLinks] = useState([{ label: "", url: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function updateLink(i: number, field: "label" | "url", value: string) {
    setLinks((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    const formData = new FormData();
    formData.set("slug", slug);
    formData.set("title", title);
    formData.set("track", track);
    formData.set("progress_status", progressStatus);
    formData.set("visibility", visibility);
    formData.set("summary", summary);
    formData.set("description", description);
    formData.set("skills", skills);
    formData.set("content_type", contentType);
    if (contentType === "docs") {
      formData.set("details_markdown", detailsMarkdown);
    } else if (contentType === "notebook") {
      if (file) formData.set("file", file);
    } else {
      formData.set("code_language", codeLanguage);
      if (file) {
        formData.set("file", file);
      } else {
        formData.set("code_source", codeSource);
      }
    }
    for (const link of links) {
      if (link.label && link.url) {
        formData.append("link_label", link.label);
        formData.append("link_url", link.url);
      }
    }

    try {
      const res = await fetch("/api/admin/projects", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save project.");
      setResult({ ok: true, message: `Created "${slug}". ` });
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-4xl font-black tracking-tight text-foreground-bright">
        Add Project
      </h1>
      <p className="mt-3 text-sm text-muted">
        Only reachable from the tailnet. Visibility defaults to draft — flip
        it to published when ready.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-foreground-bright">Title</label>
          <input
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="mt-1 w-full border border-border-soft bg-transparent px-3 py-2 text-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground-bright">Slug</label>
          <input
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Lowercase letters, numbers, and hyphens only (e.g. my-project)"
            className="mt-1 w-full border border-border-soft bg-transparent px-3 py-2 text-foreground"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground-bright">Track</label>
            <input
              required
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              placeholder="Database Management"
              className="mt-1 w-full border border-border-soft bg-transparent px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground-bright">Content type</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="mt-1 w-full border border-border-soft bg-transparent px-3 py-2 text-foreground"
            >
              <option value="docs">Docs</option>
              <option value="notebook">Jupyter Notebook</option>
              <option value="code">Code Snippet (SQL, Python, …)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground-bright">Progress</label>
            <select
              value={progressStatus}
              onChange={(e) => setProgressStatus(e.target.value)}
              className="mt-1 w-full border border-border-soft bg-transparent px-3 py-2 text-foreground"
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
              onChange={(e) => setVisibility(e.target.value)}
              className="mt-1 w-full border border-border-soft bg-transparent px-3 py-2 text-foreground"
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
            className="mt-1 w-full border border-border-soft bg-transparent px-3 py-2 text-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground-bright">Description</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full border border-border-soft bg-transparent px-3 py-2 text-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground-bright">
            Skills (comma-separated)
          </label>
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="MySQL, ERD, Python"
            className="mt-1 w-full border border-border-soft bg-transparent px-3 py-2 text-foreground"
          />
        </div>

        {contentType === "docs" ? (
          <div>
            <label className="block text-sm font-semibold text-foreground-bright">
              Writeup (Markdown)
            </label>
            <textarea
              value={detailsMarkdown}
              onChange={(e) => setDetailsMarkdown(e.target.value)}
              rows={10}
              className="mt-1 w-full border border-border-soft bg-transparent px-3 py-2 font-mono text-sm text-foreground"
            />
          </div>
        ) : contentType === "notebook" ? (
          <div>
            <label className="block text-sm font-semibold text-foreground-bright">
              Upload .ipynb file
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const dropped = e.dataTransfer.files[0];
                if (dropped) setFile(dropped);
              }}
              className={`mt-1 flex flex-col items-center justify-center border-2 border-dashed p-8 text-center text-sm ${
                dragOver ? "border-accent text-accent" : "border-border-soft text-muted"
              }`}
            >
              {file ? (
                <p>{file.name}</p>
              ) : (
                <p>Drag and drop a .ipynb file here, or</p>
              )}
              <label className="mt-2 cursor-pointer text-accent underline-offset-4 hover:underline">
                browse
                <input
                  type="file"
                  accept=".ipynb"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground-bright">Language</label>
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="mt-1 w-full border border-border-soft bg-transparent px-3 py-2 text-foreground"
              >
                {CODE_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted">
                Any language works — this list is just a shortcut, type your own if it&apos;s not here.
              </p>
              <input
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                placeholder="Custom language tag"
                className="mt-1 w-full border border-border-soft bg-transparent px-3 py-2 text-sm text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground-bright">
                Paste code, or upload a file below
              </label>
              <textarea
                value={codeSource}
                onChange={(e) => {
                  setCodeSource(e.target.value);
                  if (e.target.value) setFile(null);
                }}
                rows={8}
                placeholder="SELECT * FROM projects;"
                className="mt-1 w-full border border-border-soft bg-transparent px-3 py-2 font-mono text-sm text-foreground"
              />
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const dropped = e.dataTransfer.files[0];
                if (dropped) {
                  setFile(dropped);
                  setCodeSource("");
                }
              }}
              className={`flex flex-col items-center justify-center border-2 border-dashed p-8 text-center text-sm ${
                dragOver ? "border-accent text-accent" : "border-border-soft text-muted"
              }`}
            >
              {file ? (
                <p>{file.name}</p>
              ) : (
                <p>Or drag and drop a file here</p>
              )}
              <label className="mt-2 cursor-pointer text-accent underline-offset-4 hover:underline">
                browse
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const picked = e.target.files?.[0] ?? null;
                    setFile(picked);
                    if (picked) setCodeSource("");
                  }}
                />
              </label>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-foreground-bright">
            External links (optional)
          </label>
          {links.map((link, i) => (
            <div key={i} className="mt-2 flex gap-2">
              <input
                value={link.label}
                onChange={(e) => updateLink(i, "label", e.target.value)}
                placeholder="GitHub"
                className="w-1/3 border border-border-soft bg-transparent px-3 py-2 text-foreground"
              />
              <input
                value={link.url}
                onChange={(e) => updateLink(i, "url", e.target.value)}
                placeholder="https://github.com/you/repo"
                className="flex-1 border border-border-soft bg-transparent px-3 py-2 text-foreground"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setLinks((prev) => [...prev, { label: "", url: "" }])}
            className="mt-2 text-sm font-semibold text-accent hover:underline"
          >
            + Add another link
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full border-2 border-accent bg-accent px-4 py-3 font-bold text-background disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Create Project"}
        </button>

        {result && (
          <p className={result.ok ? "text-sm text-accent" : "text-sm text-red-400"}>
            {result.message}
            {result.ok && (
              <>
                {" "}
                <a href={`/projects/${slug}`} className="underline underline-offset-4">
                  View it →
                </a>
              </>
            )}
          </p>
        )}
      </form>
    </div>
  );
}
