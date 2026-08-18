import Link from "next/link";
import { listAdminPosts } from "@/lib/admin-blog";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await listAdminPosts();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl text-foreground-bright">Manage Blog</h1>
        <Link href="/admin/blog/new" className="text-sm font-semibold text-accent hover:underline">
          + New post
        </Link>
      </div>
      <p className="mt-3 text-sm text-muted">Includes drafts.</p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b-2 border-border-soft text-foreground-bright">
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Published at</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b border-border-soft/50">
                <td className="py-3 pr-4 font-semibold text-foreground-bright">{p.title}</td>
                <td className="py-3 pr-4">
                  <span
                    className={
                      p.status === "published" ? "chip-brutal bg-accent-lime" : "chip-brutal bg-card text-muted"
                    }
                  >
                    {p.status}
                  </span>
                </td>
                <td className="py-3 pr-4 text-muted">
                  {p.publishedAt ? new Date(p.publishedAt).toLocaleString() : "—"}
                </td>
                <td className="py-3 text-right">
                  <Link href={`/admin/blog/${p.slug}`} className="font-semibold text-accent hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-muted">
                  No posts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
