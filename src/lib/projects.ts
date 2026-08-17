import type { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";

export type ProjectStatus = "not-started" | "in-progress" | "done";
export type ProjectContentType = "docs" | "notebook" | "code";

export type ProjectLink = {
  label: string;
  url: string;
};

export type Project = {
  slug: string;
  title: string;
  track: string;
  status: ProjectStatus;
  contentType: ProjectContentType;
  codeLanguage: string | null;
  summary: string;
  description: string;
  skills: string[];
  /** Markdown, rendered on the project detail page — ERD, schema notes, sample query/result. */
  details: string | null;
  links: ProjectLink[];
};

type ProjectRow = RowDataPacket & {
  id: number;
  slug: string;
  title: string;
  track: string;
  progress_status: ProjectStatus;
  content_type: ProjectContentType;
  code_language: string | null;
  summary: string;
  description: string;
  // mysql2 auto-deserializes MySQL JSON columns into native JS values.
  skills: string[];
  details_markdown: string | null;
};

type ProjectLinkRow = RowDataPacket & {
  project_id: number;
  label: string;
  url: string;
};

function toProject(row: ProjectRow, links: ProjectLink[]): Project {
  return {
    slug: row.slug,
    title: row.title,
    track: row.track,
    status: row.progress_status,
    contentType: row.content_type,
    codeLanguage: row.code_language,
    summary: row.summary,
    description: row.description,
    skills: row.skills,
    details: row.details_markdown,
    links,
  };
}

async function getLinksByProjectId(projectIds: number[]): Promise<Map<number, ProjectLink[]>> {
  const linksByProject = new Map<number, ProjectLink[]>();
  if (projectIds.length === 0) return linksByProject;

  const [rows] = await getPool().query<ProjectLinkRow[]>(
    `SELECT project_id, label, url FROM project_links
     WHERE project_id IN (?) ORDER BY sort_order`,
    [projectIds],
  );
  for (const row of rows) {
    const existing = linksByProject.get(row.project_id) ?? [];
    existing.push({ label: row.label, url: row.url });
    linksByProject.set(row.project_id, existing);
  }
  return linksByProject;
}

export async function getProjects(): Promise<Project[]> {
  const [rows] = await getPool().query<ProjectRow[]>(
    `SELECT id, slug, title, track, progress_status, content_type, code_language, summary, description, skills, details_markdown
     FROM projects
     WHERE visibility = 'published'
     ORDER BY sort_order`,
  );
  const linksByProject = await getLinksByProjectId(rows.map((r) => r.id));
  return rows.map((row) => toProject(row, linksByProject.get(row.id) ?? []));
}

export async function getProject(slug: string): Promise<Project | null> {
  const [rows] = await getPool().query<ProjectRow[]>(
    `SELECT id, slug, title, track, progress_status, content_type, code_language, summary, description, skills, details_markdown
     FROM projects
     WHERE slug = ? AND visibility = 'published'
     LIMIT 1`,
    [slug],
  );
  const row = rows[0];
  if (!row) return null;
  const linksByProject = await getLinksByProjectId([row.id]);
  return toProject(row, linksByProject.get(row.id) ?? []);
}
