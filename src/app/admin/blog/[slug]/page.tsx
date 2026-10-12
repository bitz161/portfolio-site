import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminPost } from "@/lib/admin-blog";
import PostForm from "../PostForm";

export const dynamic = "force-dynamic";

export default async function EditPost(props: PageProps<"/admin/blog/[slug]">) {
  const { slug } = await props.params;
  const post = await getAdminPost(slug);
  if (!post) notFound();
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/blog" className="kicker hover:text-ink">← Blog</Link>
          <h1 className="h-display mt-3 text-4xl">{post.title}</h1>
        </div>
        {post.status === "published" && <Link href={`/blog/${slug}`} className="btn-ghost">View live ↗</Link>}
      </div>
      <div className="mt-8">
        <PostForm post={post} />
      </div>
    </>
  );
}
