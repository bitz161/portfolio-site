import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
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
    <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
      <Link
        href="/blog"
        className="border-b border-foreground-bright pb-0.5 font-mono text-xs font-bold tracking-widest text-foreground-bright uppercase transition-colors hover:border-accent hover:text-accent"
      >
        &larr; All posts
      </Link>

      <span className="folio-label mt-8 block">
        {post.publishedAt?.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </span>
      <h1 className="font-serif text-foreground-bright mt-3 text-4xl leading-tight sm:text-5xl">
        {post.title}
      </h1>

      {post.coverImageUrl && (
        <div className="relative mt-9 aspect-video overflow-hidden border-2 border-foreground-bright">
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="prose prose-headings:font-serif prose-a:text-accent prose-strong:text-foreground-bright prose-code:before:content-none prose-code:after:content-none prose-pre:border-2 prose-pre:border-foreground-bright prose-pre:bg-foreground-bright prose-code:rounded-none prose-img:border-2 prose-img:border-foreground-bright mt-10 max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {post.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
