import Image from "next/image";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div>
      <div className="border-b-2 border-foreground-bright px-6 py-14 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <span className="kicker mb-4 block">Writing</span>
          <h1 className="font-serif text-foreground-bright mb-4 text-4xl sm:text-5xl">Blog</h1>
          <p className="max-w-xl border-l-4 border-foreground-bright pl-4 font-mono text-sm text-muted">
            Notes on building and running this stack, and whatever comes out of
            the portfolio projects along the way.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        {posts.length === 0 ? (
          <div className="border-2 border-foreground-bright p-12 text-center">
            <p className="font-mono text-sm text-muted">Nothing published yet &mdash; check back soon.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group grid grid-cols-1 border-2 border-foreground-bright bg-background transition-transform hover:-translate-y-0.5 md:grid-cols-5"
              >
                <div className="relative h-52 overflow-hidden border-b-2 border-foreground-bright md:col-span-2 md:h-64 md:border-r-2 md:border-b-0">
                  {post.coverImageUrl ? (
                    <Image
                      src={post.coverImageUrl}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 40vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-foreground-bright">
                      <span className="font-serif text-4xl text-background/20">{post.title.slice(0, 1)}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between p-6 sm:p-8 md:col-span-3">
                  <div>
                    <div className="mb-4 flex items-center gap-4">
                      {post.publishedAt && (
                        <span className="font-mono text-xs text-muted">
                          {post.publishedAt.toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    <h2 className="font-serif text-foreground-bright mb-3 text-xl leading-tight sm:text-2xl">
                      <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-accent">
                        {post.title}
                      </Link>
                    </h2>
                    {post.excerpt && <p className="mb-5 text-sm leading-relaxed text-muted">{post.excerpt}</p>}
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex w-fit items-center gap-2 border-2 border-foreground-bright bg-background px-5 py-3 font-mono text-xs font-bold tracking-widest text-foreground-bright uppercase transition-colors hover:bg-foreground-bright hover:text-background"
                  >
                    Read Post &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
