import Link from "next/link";
import { listAdminPosts } from "@/lib/admin-blog";
import { formatDate } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AdminBlog() {
  const posts = await listAdminPosts();
  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <h1 className="h-display text-5xl">Blog</h1>
        <Link href="/admin/blog/new" className="btn">+ New post</Link>
      </div>
      <div className="surface mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-muted">
            <tr className="border-b border-line">
              <th className="px-5 py-3 font-normal">Title</th>
              <th className="px-5 py-3 font-normal">Status</th>
              <th className="px-5 py-3 font-normal">Published</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-6 text-muted">No posts yet.</td></tr>
            )}
            {posts.map((p) => (
              <tr key={p.slug} className="border-b border-line last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3"><p>{p.title}</p><p className="font-mono text-xs text-muted">{p.slug}</p></td>
                <td className={`px-5 py-3 font-mono text-xs ${p.status === "published" ? "text-brass-soft" : "text-muted"}`}>{p.status}</td>
                <td className="px-5 py-3 text-muted">{formatDate(p.publishedAt)}</td>
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  <Link href={`/admin/blog/${p.slug}`} className="text-ember-soft hover:underline">Edit</Link>
                  {p.status === "published" && <Link href={`/blog/${p.slug}`} className="ml-4 text-muted hover:text-ink">View ↗</Link>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
