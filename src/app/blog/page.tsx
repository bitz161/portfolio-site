import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/blog";
import PostCard from "@/components/blog/PostCard";
import { Letters, Reveal } from "@/components/motion/primitives";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Writing" };

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  return (
    <section className="shell pt-32 pb-16">
      <h1 className="t-poster mb-14"><Letters text="Notes from the work" onLoad /></h1>
      {posts.length === 0 ? (
        <p className="field p-6">Nothing published yet.</p>
      ) : (
        <div className="grid gap-[calc(var(--gap)/2)]">
          {posts.map((post, i) => (
            <Reveal key={post.slug} i={i}>
              <PostCard post={post} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
