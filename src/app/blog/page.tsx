import Link from "next/link";
import { getPublishedPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

const CARD_COLORS = ["bg-accent-warm", "bg-accent-danger", "bg-accent-teal", "bg-accent-lime"];

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-serif text-4xl text-foreground-bright sm:text-5xl">
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
          {posts.map((post, i) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className={`card-brutal group flex flex-col p-6 text-foreground-bright transition-transform hover:-translate-y-1 ${CARD_COLORS[i % CARD_COLORS.length]}`}
            >
              <span className="chip-brutal bg-card">
                {post.publishedAt?.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <h2 className="mt-3 text-2xl leading-tight font-bold">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="mt-2 text-sm leading-6">{post.excerpt}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
