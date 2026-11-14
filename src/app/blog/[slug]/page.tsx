import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPost, getPublishedPosts } from "@/lib/blog";
import { SITE, formatDate } from "@/lib/site";
import { headings, readingMinutes } from "@/lib/toc";
import { Letters } from "@/components/motion/primitives";
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
    <article className="shell pt-32 pb-16">
      <header className="grid gap-y-8">
        <h1 className="t-title"><Letters text={post.title} step={0.014} onLoad /></h1>
        <div className="fade-in" style={{ "--d": "350ms" } as React.CSSProperties}>
          {post.excerpt && <p className="t-lead max-w-[52ch]">{post.excerpt}</p>}
          <p className="soft mt-4">
            {formatDate(post.publishedAt)}, {readingMinutes(post.content)} min read
          </p>
        </div>
      </header>

      {post.coverImageUrl && (
        <div className="field relative mt-12 aspect-[16/9] overflow-hidden md:aspect-[21/9]">
          <Image src={post.coverImageUrl} alt="" fill priority sizes="100vw" className="settle object-cover" />
        </div>
      )}

      {/* xl: contents | text | author rail. lg: text | rail (contents moves into the rail). */}
      <div className={`mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] ${toc.length > 1 ? "xl:grid-cols-[240px_minmax(0,72ch)_300px] xl:justify-between" : ""}`}>
        {toc.length > 1 && (
          <aside className="hidden xl:sticky xl:top-8 xl:block xl:self-start">
            <Toc items={toc} />
          </aside>
        )}
        <div className="min-w-0 max-w-[72ch]">
          <Markdown>{post.content}</Markdown>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          {toc.length > 1 && (
            <div className="field hidden p-6 lg:block xl:hidden">
              <Toc items={toc} />
            </div>
          )}
          <div className="field p-6">
            <p className="soft">Written by</p>
            <p className="t-lead mt-1 font-medium">{SITE.name}</p>
            <p className="mt-1">{SITE.role}</p>
            <p className="mt-4 flex gap-5">
              <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer" className="link">LinkedIn</a>
              <a href={SITE.github} target="_blank" rel="noopener noreferrer" className="link">GitHub</a>
            </p>
          </div>
          {others.length > 0 && (
            <div className="field p-6">
              <p className="soft">More writing</p>
              <ul className="mt-3 space-y-3">
                {others.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/blog/${p.slug}`} prefetch className="link block">{p.title}</Link>
                    <span className="t-small soft">{formatDate(p.publishedAt)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Link href="/blog" className="link inline-block font-medium">All writing</Link>
        </aside>
      </div>
    </article>
  );
}
