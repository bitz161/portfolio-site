import type { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";

export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  publishedAt: Date | null;
};

type BlogPostRow = RowDataPacket & {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  published_at: Date | null;
};

function toBlogPost(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    coverImageUrl: row.cover_image_url,
    publishedAt: row.published_at,
  };
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const [rows] = await getPool().query<BlogPostRow[]>(
    `SELECT id, slug, title, excerpt, content, cover_image_url, published_at
     FROM blog_posts
     WHERE status = 'published' AND published_at <= NOW()
     ORDER BY published_at DESC`,
  );
  return rows.map(toBlogPost);
}

export async function getPublishedPost(slug: string): Promise<BlogPost | null> {
  const [rows] = await getPool().query<BlogPostRow[]>(
    `SELECT id, slug, title, excerpt, content, cover_image_url, published_at
     FROM blog_posts
     WHERE slug = ? AND status = 'published' AND published_at <= NOW()
     LIMIT 1`,
    [slug],
  );
  return rows[0] ? toBlogPost(rows[0]) : null;
}
