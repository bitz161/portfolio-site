import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { getPublishedPost } from "@/lib/blog";
import { formatDate } from "@/lib/site";
import Markdown from "@/components/Markdown";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await getPublishedPost((await props.params).slug);
  return post ? { title: post.title, description: post.excerpt ?? undefined } : {};
}

export default async function PostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  return (
    <article className="pt-28 pb-16">
      <div className="mx-auto max-w-[68ch] px-4 sm:px-8">
        <Link href="/blog" className="kicker transition-colors hover:text-ink">← All writing</Link>
        <p className="kicker mt-10">{formatDate(post.publishedAt)}</p>
        <h1 className="h-display mt-4 text-[clamp(2.4rem,6vw,4.2rem)]">{post.title}</h1>
        {post.excerpt && <p className="mt-6 text-lg leading-relaxed text-muted">{post.excerpt}</p>}
      </div>

      <div className="shell mt-10">
        <ViewTransition name={`post-${post.slug}`} share="morph" default="none">
          <div className="relative mx-auto aspect-[16/9] max-w-4xl overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-steel/30 via-bg to-ember/20">
            {post.coverImageUrl && <Image src={post.coverImageUrl} alt="" fill priority sizes="(min-width: 1024px) 900px, 100vw" className="object-cover" />}
          </div>
        </ViewTransition>
      </div>

      <div className="mx-auto mt-12 max-w-[68ch] px-4 sm:px-8">
        <Markdown>{post.content}</Markdown>
      </div>
    </article>
  );
}
