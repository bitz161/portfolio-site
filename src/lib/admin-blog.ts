import type { RowDataPacket } from "mysql2";
import { getAdminPool } from "@/lib/db";

export type PostStatus = "draft" | "published";

export type AdminBlogPostSummary = {
  id: number;
  slug: string;
  title: string;
  status: PostStatus;
  publishedAt: Date | null;
};

export type AdminBlogPost = AdminBlogPostSummary & {
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
};

type SummaryRow = RowDataPacket & {
  id: number;
  slug: string;
  title: string;
  status: PostStatus;
  published_at: Date | null;
};

type DetailRow = SummaryRow & {
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
};

// Admin-only reads (drafts included) -- uses the same least-privilege
// portfolio_admin pool the write path uses, never the public portfolio_web
// one that only sees published posts.
export async function listAdminPosts(): Promise<AdminBlogPostSummary[]> {
  const [rows] = await getAdminPool().query<SummaryRow[]>(
    `SELECT id, slug, title, status, published_at
     FROM blog_posts
     ORDER BY COALESCE(published_at, created_at) DESC`,
  );
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status,
    publishedAt: row.published_at,
  }));
}

export async function getAdminPost(slug: string): Promise<AdminBlogPost | null> {
  const [rows] = await getAdminPool().query<DetailRow[]>(
    `SELECT id, slug, title, status, published_at, excerpt, content, cover_image_url
     FROM blog_posts
     WHERE slug = ?
     LIMIT 1`,
    [slug],
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status,
    publishedAt: row.published_at,
    excerpt: row.excerpt,
    content: row.content,
    coverImageUrl: row.cover_image_url,
  };
}
