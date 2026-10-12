import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/blog";
import SectionHead from "@/components/site/SectionHead";
import PostCard from "@/components/blog/PostCard";
import { Reveal } from "@/components/motion/primitives";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Writing" };

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  return (
    <section className="shell pt-36 pb-16">
      <SectionHead index="Writing" label={`${posts.length} ${posts.length === 1 ? "post" : "posts"}`} title={<>Notes from the <em className="text-ember-soft">work.</em></>} />
      {posts.length === 0 ? (
        <p className="surface p-6 text-muted">Nothing published yet.</p>
      ) : (
        <div className={`grid gap-4 ${posts.length > 1 ? "md:grid-cols-2" : ""}`}>
          {posts.map((post, i) => (
            <Reveal key={post.slug} i={i}>
              <PostCard post={post} wide={posts.length === 1} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
