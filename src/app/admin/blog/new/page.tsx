import BlogPostForm from "../BlogPostForm";

export default function NewBlogPostPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-4xl text-foreground-bright">New Post</h1>
      <p className="mt-3 text-sm text-muted">
        Only reachable from the tailnet. Status defaults to draft — set it to published (or leave a future
        &quot;Published at&quot; to schedule) when ready.
      </p>
      <BlogPostForm mode="create" />
    </div>
  );
}
