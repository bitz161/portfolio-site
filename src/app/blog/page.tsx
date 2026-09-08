import Link from "next/link";
import { getPublishedPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <span className="kicker">Notes</span>
      <h1 className="mt-4 font-serif text-4xl font-bold text-foreground-bright sm:text-5xl">
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
        <div
          className={`mt-14 grid grid-cols-1 gap-6 ${posts.length > 1 ? "sm:grid-cols-2" : "max-w-xl"}`}
        >
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="card-brutal group flex flex-col bg-card p-6 text-foreground transition-transform hover:-translate-y-1"
            >
              <span className="chip-brutal">
                {post.publishedAt?.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <h2 className="mt-3 text-2xl leading-tight font-semibold text-foreground-bright">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="mt-2 text-sm leading-6 text-muted">{post.excerpt}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
