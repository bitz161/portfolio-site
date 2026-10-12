import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { getPublishedPost, getPublishedPosts } from "@/lib/blog";
import { SITE, formatDate } from "@/lib/site";
import { headings, readingMinutes } from "@/lib/toc";
import Markdown from "@/components/Markdown";
import Toc from "@/components/blog/Toc";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await getPublishedPost((await props.params).slug);
  return post ? { title: post.title, description: post.excerpt ?? undefined } : {};
}

export default async function PostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const [post, all] = await Promise.all([getPublishedPost(slug), getPublishedPosts()]);
  if (!post) notFound();
  const toc = headings(post.content);
  const others = all.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <article className="shell pt-28 pb-16">
      <Link href="/blog" className="kicker transition-colors hover:text-ink">← All writing</Link>

      <header className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
        <div>
          <p className="kicker fade-in">
            {formatDate(post.publishedAt)} · {readingMinutes(post.content)} min read
          </p>
          <h1 className="h-display mt-4 max-w-5xl text-[clamp(2.6rem,6.5vw,5.6rem)]">{post.title}</h1>
        </div>
        {post.excerpt && (
          <p className="fade-in border-l-2 border-ember pl-5 text-lg leading-relaxed text-muted" style={{ "--d": "300ms" } as React.CSSProperties}>
            {post.excerpt}
          </p>
        )}
      </header>

      <ViewTransition name={`post-${post.slug}`} share="morph" default="none">
        <div className="relative mt-12 aspect-[16/9] overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-steel/30 via-bg to-ember/20 md:aspect-[21/9]">
          {post.coverImageUrl && <Image src={post.coverImageUrl} alt="" fill priority sizes="(min-width: 1408px) 1312px, 100vw" className="object-cover" />}
        </div>
      </ViewTransition>

      {/* xl: contents | text | author rail. lg: text | rail (contents moves into the rail). */}
      <div className={`mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] ${toc.length > 1 ? "xl:grid-cols-[240px_minmax(0,72ch)_300px] xl:justify-between" : ""}`}>
        {toc.length > 1 && (
          <aside className="hidden xl:sticky xl:top-24 xl:block xl:self-start">
            <Toc items={toc} />
          </aside>
        )}
        <div className="min-w-0 max-w-[72ch]">
          <Markdown>{post.content}</Markdown>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {toc.length > 1 && (
            <div className="surface hidden p-6 lg:block xl:hidden">
              <Toc items={toc} />
            </div>
          )}
          <div className="surface p-6 text-sm">
            <p className="label">Written by</p>
            <p className="mt-3 font-display text-2xl">{SITE.name}</p>
            <p className="mt-1 text-muted">{SITE.role}</p>
            <div className="mt-4 flex gap-4">
              <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer" className="text-ember-soft hover:underline">LinkedIn ↗</a>
              <a href={SITE.github} target="_blank" rel="noopener noreferrer" className="text-ember-soft hover:underline">GitHub ↗</a>
            </div>
          </div>
          {others.length > 0 && (
            <div className="surface p-6">
              <p className="label">More writing</p>
              <ul className="mt-4 space-y-3">
                {others.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/blog/${p.slug}`} prefetch className="block text-sm text-muted transition-colors hover:text-ink">
                      {p.title}
                      <span className="mt-0.5 block font-mono text-xs opacity-70">{formatDate(p.publishedAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
