import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getAdminPool } from "@/lib/db";
import { getAdminMinioClient, PROJECT_FILES_BUCKET } from "@/lib/minio";
import { notebookToMarkdown } from "@/lib/notebook";
import { codeToMarkdown } from "@/lib/code-file";
import { requireTailscaleIdentity, requireSameOrigin } from "@/lib/admin-auth";

type ContentType = "docs" | "notebook" | "code";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // keep well under the container's 256m mem_limit
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function isContentType(value: FormDataEntryValue | null): value is ContentType {
  return value === "docs" || value === "notebook" || value === "code";
}

async function readLimitedFile(file: File): Promise<Buffer> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File is too large (${Math.round(file.size / 1024 / 1024)}MB, max 10MB).`);
  }
  return Buffer.from(await file.arrayBuffer());
}

export async function POST(request: Request) {
  const forbidden = requireTailscaleIdentity(request) ?? requireSameOrigin(request);
  if (forbidden) return forbidden;

  const formData = await request.formData();

  const slug = String(formData.get("slug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const track = String(formData.get("track") ?? "").trim();
  const progressStatus = String(formData.get("progress_status") ?? "not-started");
  const visibility = String(formData.get("visibility") ?? "draft");
  const summary = String(formData.get("summary") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const skillsRaw = String(formData.get("skills") ?? "");
  const skills = skillsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const contentTypeValue = formData.get("content_type");

  if (!slug || !title || !track || !summary || !description || !isContentType(contentTypeValue)) {
    return NextResponse.json({ error: "Missing or invalid required fields." }, { status: 400 });
  }
  if (!SLUG_PATTERN.test(slug)) {
    return NextResponse.json(
      { error: "Slug must be lowercase letters, numbers, and hyphens only (e.g. my-project)." },
      { status: 400 },
    );
  }
  if (!["not-started", "in-progress", "done"].includes(progressStatus)) {
    return NextResponse.json({ error: "Invalid progress status." }, { status: 400 });
  }
  if (!["draft", "published"].includes(visibility)) {
    return NextResponse.json({ error: "Invalid visibility." }, { status: 400 });
  }
  const contentType = contentTypeValue;

  const pool = getAdminPool();

  // Check the slug is free before doing any file processing/upload work,
  // so a predictable duplicate doesn't leave orphaned MinIO objects behind.
  const [existing] = await pool.query<RowDataPacket[]>(
    `SELECT id FROM projects WHERE slug = ? LIMIT 1`,
    [slug],
  );
  if (existing.length > 0) {
    return NextResponse.json({ error: `Slug "${slug}" is already in use.` }, { status: 409 });
  }

  let detailsMarkdown: string | null = null;
  let sourceLink: { label: string; url: string } | null = null;
  let codeLanguage: string | null = null;

  try {
    if (contentType === "docs") {
      detailsMarkdown = String(formData.get("details_markdown") ?? "").trim() || null;
    } else if (contentType === "notebook") {
      const file = formData.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "A .ipynb file upload is required." }, { status: 400 });
      }
      const buffer = await readLimitedFile(file);

      let notebook;
      try {
        notebook = JSON.parse(buffer.toString("utf-8"));
      } catch {
        return NextResponse.json({ error: "Uploaded file is not valid JSON (.ipynb)." }, { status: 400 });
      }
      if (!Array.isArray(notebook?.cells)) {
        return NextResponse.json(
          { error: "Uploaded file doesn't look like a notebook (missing a cells array)." },
          { status: 400 },
        );
      }

      detailsMarkdown = await notebookToMarkdown(notebook, slug);

      const key = `projects/${slug}/source.ipynb`;
      await getAdminMinioClient().putObject(PROJECT_FILES_BUCKET, key, buffer, buffer.length, {
        "Content-Type": "application/x-ipynb+json",
      });
      sourceLink = { label: "Download notebook", url: `/api/files/${key}` };
    } else {
      // "code": SQL, Python, Bash, or anything else -- either an uploaded
      // file or pasted text, tagged with a language for the fenced block and
      // the type badge. New languages need no schema change.
      codeLanguage = String(formData.get("code_language") ?? "").trim() || "text";
      const file = formData.get("file");
      const pastedSource = String(formData.get("code_source") ?? "");

      if (file instanceof File) {
        const buffer = await readLimitedFile(file);
        detailsMarkdown = codeToMarkdown(buffer.toString("utf-8"), codeLanguage);

        const key = `projects/${slug}/${file.name || "source.txt"}`;
        await getAdminMinioClient().putObject(PROJECT_FILES_BUCKET, key, buffer, buffer.length, {
          "Content-Type": "text/plain",
        });
        sourceLink = { label: "View source", url: `/api/files/${key}` };
      } else if (pastedSource.trim()) {
        detailsMarkdown = codeToMarkdown(pastedSource, codeLanguage);
      } else {
        return NextResponse.json(
          { error: "Paste some code or upload a file for this content type." },
          { status: 400 },
        );
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not process the uploaded content.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const extraLinks: { label: string; url: string }[] = [];
  const extraLabels = formData.getAll("link_label");
  const extraUrls = formData.getAll("link_url");
  for (let i = 0; i < extraLabels.length; i++) {
    const label = String(extraLabels[i]).trim();
    const url = String(extraUrls[i] ?? "").trim();
    if (label && url) extraLinks.push({ label, url });
  }
  if (sourceLink) extraLinks.push(sourceLink);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query<ResultSetHeader>(
      `INSERT INTO projects
        (slug, title, track, progress_status, content_type, code_language, visibility, summary, description, skills, details_markdown, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        slug,
        title,
        track,
        progressStatus,
        contentType,
        codeLanguage,
        visibility,
        summary,
        description,
        JSON.stringify(skills),
        detailsMarkdown,
      ],
    );
    const projectId = result.insertId;

    for (let i = 0; i < extraLinks.length; i++) {
      await conn.query(
        `INSERT INTO project_links (project_id, label, url, sort_order) VALUES (?, ?, ?, ?)`,
        [projectId, extraLinks[i].label, extraLinks[i].url, i],
      );
    }

    await conn.commit();
    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    await conn.rollback();
    console.error("Failed to save project:", err);
    return NextResponse.json({ error: "Failed to save project. See server logs for details." }, { status: 500 });
  } finally {
    conn.release();
  }
}
