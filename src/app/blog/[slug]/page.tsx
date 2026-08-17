import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPublishedPost } from "@/lib/blog";

export const dynamic = "force-dynamic";

export default async function BlogPostPage(
  props: PageProps<"/blog/[slug]">,
) {
  const { slug } = await props.params;
  const post = await getPublishedPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/blog"
        className="text-sm font-semibold tracking-wide text-muted uppercase transition-colors hover:text-accent"
      >
        &larr; All posts
      </Link>

      <span className="mt-8 block text-xs font-semibold tracking-wide text-muted uppercase">
        {post.publishedAt?.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </span>
      <h1 className="mt-3 font-serif text-4xl font-black tracking-tight text-foreground-bright sm:text-5xl">
        {post.title}
      </h1>

      {post.coverImageUrl && (
        <div className="relative mt-9 aspect-video overflow-hidden border-2 border-border-soft">
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="prose prose-invert prose-headings:font-serif prose-headings:font-bold prose-a:text-accent prose-strong:text-foreground-bright mt-10 max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
