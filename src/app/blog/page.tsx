import Link from "next/link";
import { getPublishedPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-5 flex items-center gap-2.5 text-xs font-bold tracking-widest text-accent uppercase">
        <span className="h-0.5 w-7 bg-accent" />
        Writing
      </div>
      <h1 className="font-serif text-4xl font-black tracking-tight text-foreground-bright sm:text-5xl">
        Blog
      </h1>
      <p className="mt-4 max-w-xl text-muted">
        Notes on building and running this stack, and whatever comes out of
        the portfolio projects along the way.
      </p>

      {posts.length === 0 ? (
        <p className="mt-14 text-sm text-muted">
          Nothing published yet — check back soon.
        </p>
      ) : (
        <ul className="mt-14 divide-y divide-border-soft border-t-2 border-border">
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/blog/${post.slug}`} className="group block py-8">
                <span className="text-xs font-semibold tracking-wide text-muted uppercase">
                  {post.publishedAt?.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <h2 className="mt-2 font-serif text-2xl font-bold text-foreground-bright group-hover:text-accent">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {post.excerpt}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
