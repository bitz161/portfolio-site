import type { RowDataPacket } from "mysql2";
import { getAdminPool } from "@/lib/db";
import type { ProjectContentType, ProjectLink, ProjectStatus } from "@/lib/projects";

export type ProjectVisibility = "draft" | "published";

export type AdminProjectSummary = {
  id: number;
  slug: string;
  title: string;
  track: string;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  sortOrder: number;
};

export type AdminProject = AdminProjectSummary & {
  contentType: ProjectContentType;
  codeLanguage: string | null;
  summary: string;
  description: string;
  skills: string[];
  details: string | null;
  links: ProjectLink[];
  imageKey: string | null;
  metricBefore: string | null;
  metricAfter: string | null;
  metricLabel: string | null;
};

type SummaryRow = RowDataPacket & {
  id: number;
  slug: string;
  title: string;
  track: string;
  progress_status: ProjectStatus;
  visibility: ProjectVisibility;
  sort_order: number;
};

type DetailRow = SummaryRow & {
  content_type: ProjectContentType;
  code_language: string | null;
  summary: string;
  description: string;
  skills: string[];
  details_markdown: string | null;
  image_key: string | null;
  metric_before: string | null;
  metric_after: string | null;
  metric_label: string | null;
};

type LinkRow = RowDataPacket & {
  label: string;
  url: string;
};

// Admin-only reads (all visibilities, not just published) -- uses the
// same least-privilege portfolio_admin pool the write path uses, never
// the public portfolio_web one.
export async function listAdminProjects(): Promise<AdminProjectSummary[]> {
  const [rows] = await getAdminPool().query<SummaryRow[]>(
    `SELECT id, slug, title, track, progress_status, visibility, sort_order
     FROM projects
     ORDER BY sort_order, title`,
  );
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    track: row.track,
    status: row.progress_status,
    visibility: row.visibility,
    sortOrder: row.sort_order,
  }));
}

export async function getAdminProject(slug: string): Promise<AdminProject | null> {
  const [rows] = await getAdminPool().query<DetailRow[]>(
    `SELECT id, slug, title, track, progress_status, content_type, code_language,
            visibility, summary, description, skills, details_markdown, sort_order,
            image_key, metric_before, metric_after, metric_label
     FROM projects
     WHERE slug = ?
     LIMIT 1`,
    [slug],
  );
  const row = rows[0];
  if (!row) return null;

  const [linkRows] = await getAdminPool().query<LinkRow[]>(
    `SELECT label, url FROM project_links WHERE project_id = ? ORDER BY sort_order`,
    [row.id],
  );

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    track: row.track,
    status: row.progress_status,
    contentType: row.content_type,
    codeLanguage: row.code_language,
    visibility: row.visibility,
    summary: row.summary,
    description: row.description,
    skills: row.skills,
    details: row.details_markdown,
    sortOrder: row.sort_order,
    links: linkRows.map((l) => ({ label: l.label, url: l.url })),
    imageKey: row.image_key,
    metricBefore: row.metric_before,
    metricAfter: row.metric_after,
    metricLabel: row.metric_label,
  };
}
