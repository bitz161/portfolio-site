"use client";

import { useState } from "react";
import type { AdminBlogPost } from "@/lib/admin-blog";
import { slugify } from "@/lib/slug";

type Props = {
  mode: "create" | "edit";
  initial?: AdminBlogPost;
};

function toLocalDatetimeInput(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export default function BlogPostForm({ mode, initial }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [status, setStatus] = useState(initial?.status ?? "draft");
  const [publishedAt, setPublishedAt] = useState(toLocalDatetimeInput(initial?.publishedAt ?? null));
  const [coverImageUrl] = useState(initial?.coverImageUrl ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    const formData = new FormData();
    if (mode === "create") formData.set("slug", slug);
    formData.set("title", title);
    formData.set("excerpt", excerpt);
    formData.set("content", content);
    formData.set("status", status);
    formData.set("published_at", publishedAt ? new Date(publishedAt).toISOString() : "");
    if (file) formData.set("cover_image", file);

    try {
      const url = mode === "create" ? "/api/admin/blog" : `/api/admin/blog/${initial!.slug}`;
      const res = await fetch(url, { method: mode === "create" ? "POST" : "PATCH", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save post.");
      setResult({ ok: true, message: mode === "create" ? `Created "${slug}".` : "Saved." });
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-1 w-full border-2 border-border-soft bg-card px-3 py-2 text-foreground focus:outline-none focus:shadow-[3px_3px_0_#000]";
  const finalSlug = mode === "create" ? slug : initial!.slug;

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-6">
      <div>
        <label className="block text-sm font-semibold text-foreground-bright">Title</label>
        <input required value={title} onChange={(e) => handleTitleChange(e.target.value)} className={inputClass} />
      </div>

      {mode === "create" ? (
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
            title="Lowercase letters, numbers, and hyphens only (e.g. my-post)"
            className={inputClass}
          />
        </div>
      ) : (
        <p className="text-xs text-muted">Slug: {initial!.slug} (not editable here)</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-foreground-bright">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={inputClass}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground-bright">
            Published at <span className="font-normal text-muted">(future = scheduled)</span>
          </label>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground-bright">Excerpt</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Short teaser shown on the blog list page."
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground-bright">
          Cover image {coverImageUrl && !file && "(currently set — upload to replace)"}
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
          className={`mt-1 flex flex-col items-center justify-center border-2 border-dashed bg-card p-6 text-center text-sm ${
            dragOver ? "border-accent text-accent" : "border-border-soft text-muted"
          }`}
        >
          {file ? (
            <p>{file.name}</p>
          ) : coverImageUrl ? (
            <p>{coverImageUrl}</p>
          ) : (
            <p>Drag and drop an image here, or</p>
          )}
          <label className="mt-2 cursor-pointer text-accent underline-offset-4 hover:underline">
            browse
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground-bright">Content (Markdown)</label>
        <p className="mt-1 text-xs text-muted">
          Don&apos;t start with a <code># Title</code> heading — the page renders the title separately.
          Reference already-uploaded images inline as{" "}
          <code>![alt](/api/images/your-file.jpg)</code>.
        </p>
        <textarea
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={16}
          className={`${inputClass} font-mono text-sm`}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="card-brutal-sm w-full bg-accent-lime px-4 py-3 font-bold text-foreground uppercase tracking-wide transition-transform hover:-translate-y-0.5 disabled:opacity-50"
      >
        {submitting ? "Saving…" : mode === "create" ? "Create Post" : "Save Changes"}
      </button>

      {result && (
        <p className={result.ok ? "text-sm font-bold text-accent-teal" : "text-sm font-bold text-accent-danger"}>
          {result.message}
          {result.ok && (
            <>
              {" "}
              <a href={`/blog/${finalSlug}`} className="underline underline-offset-4">
                View it →
              </a>
            </>
          )}
        </p>
      )}
    </form>
  );
}
