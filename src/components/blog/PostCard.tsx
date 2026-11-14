import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/lib/blog";
import { formatDate } from "@/lib/site";

/** A post as a wide row: its cover at the left, title and excerpt at the right. */
export default function PostCard({ post, headingLevel: Heading = "h3" }: { post: BlogPost; headingLevel?: "h2" | "h3" }) {
  return (
    <Link href={`/blog/${post.slug}`} prefetch className="group grid gap-x-[var(--m)] gap-y-6 lg:grid-cols-2 lg:items-end">
      <div className="field relative aspect-[16/10] overflow-hidden">
        {post.coverImageUrl && (
          <Image src={post.coverImageUrl} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="settle object-cover transition-transform duration-700 ease-std group-hover:scale-[1.04]" />
        )}
      </div>
      <div>
        <Heading className="t-head">{post.title}</Heading>
        {post.excerpt && <p className="mt-5 max-w-[44ch]">{post.excerpt}</p>}
        <p className="mt-5 flex flex-wrap gap-x-6">
          <span className="link font-medium">Read it</span>
          <span className="soft">{formatDate(post.publishedAt)}</span>
        </p>
      </div>
    </Link>
  );
}
