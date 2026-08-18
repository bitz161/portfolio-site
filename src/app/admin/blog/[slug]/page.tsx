import { notFound } from "next/navigation";
import { getAdminPost } from "@/lib/admin-blog";
import BlogPostForm from "../BlogPostForm";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getAdminPost(slug);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-4xl text-foreground-bright">Edit Post</h1>
      <BlogPostForm mode="edit" initial={post} />
    </div>
  );
}
