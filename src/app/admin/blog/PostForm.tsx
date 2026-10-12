"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminBlogPost } from "@/lib/admin-blog";
import { slugify } from "@/lib/slug";
import { Field, Section, SubmitBar, inputCls, useSubmit } from "../_ui";

/** Date -> value for <input type="datetime-local"> in the browser's own timezone. */
const toLocalInput = (d: Date | null) => (d ? new Date(new Date(d).getTime() - new Date(d).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

export default function PostForm({ post }: { post?: AdminBlogPost }) {
  const router = useRouter();
  const { busy, msg, run } = useSubmit();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [preview, setPreview] = useState<string | null>(post?.coverImageUrl ?? null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // datetime-local has no zone; send an ISO string so the server stores the intended instant.
    const at = String(fd.get("published_at") ?? "");
    fd.set("published_at", at ? new Date(at).toISOString() : "");
    if (post) {
      await run(() => fetch(`/api/admin/blog/${post.slug}`, { method: "PATCH", body: fd }), "Saved.");
      router.refresh();
    } else {
      const data = await run(() => fetch("/api/admin/blog", { method: "POST", body: fd }), "Post created.");
      if (data?.slug) router.push(`/admin/blog/${data.slug}`);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Section title="Post">
        <Field label="Title">
          <input
            name="title"
            required
            className={inputCls}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!post && !slugTouched) setSlug(slugify(e.target.value));
            }}
          />
        </Field>
        <Field label="Slug" hint={post ? "Slugs can't change after creation." : undefined}>
          <input
            name="slug"
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            readOnly={!!post}
            className={`${inputCls} font-mono read-only:opacity-60`}
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
          />
        </Field>
        <Field label="Status">
          <select name="status" className={inputCls} defaultValue={post?.status ?? "draft"}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>
        <Field label="Publish at" hint="Empty + Published = now. A future time schedules it.">
          <input name="published_at" type="datetime-local" className={inputCls} defaultValue={toLocalInput(post?.publishedAt ?? null)} />
        </Field>
        <Field label="Excerpt" wide>
          <textarea name="excerpt" rows={2} className={inputCls} defaultValue={post?.excerpt ?? ""} />
        </Field>
        <Field label="Cover image" hint="Max 10 MB." wide>
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- blob or stored preview */}
            {preview && <img src={preview} alt="" className="h-20 w-32 rounded-lg border border-line object-cover" />}
            <input
              name="cover_image"
              type="file"
              accept="image/*"
              className={inputCls}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setPreview(URL.createObjectURL(f));
              }}
            />
          </div>
        </Field>
      </Section>
      <Section title="Content (Markdown)">
        <Field label="Body" wide>
          <textarea name="content" required rows={22} className={`${inputCls} font-mono text-xs leading-relaxed`} defaultValue={post?.content ?? ""} />
        </Field>
      </Section>
      <SubmitBar busy={busy} msg={msg} label={post ? "Save changes" : "Create post"} />
    </form>
  );
}
