import Link from "next/link";
import Image from "next/image";
import { ViewTransition } from "react";
import type { BlogPost } from "@/lib/blog";
import { formatDate } from "@/lib/site";

export default function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} prefetch className="group surface flex h-full flex-col overflow-hidden transition-[border-color,transform] duration-300 ease-std hover:-translate-y-1 hover:border-white/20">
      <ViewTransition name={`post-${post.slug}`} share="morph" default="none">
        <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-steel/30 via-bg to-ember/20">
          {post.coverImageUrl ? (
            <Image src={post.coverImageUrl} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-700 ease-std group-hover:scale-[1.04]" />
          ) : (
            <span aria-hidden className="absolute right-6 bottom-2 font-display text-8xl text-white/10">¶</span>
          )}
        </div>
      </ViewTransition>
      <div className="flex flex-1 flex-col p-6">
        <p className="kicker">{formatDate(post.publishedAt)}</p>
        <h3 className="mt-3 font-display text-3xl leading-tight">{post.title}</h3>
        {post.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>}
        <span className="mt-auto pt-6 text-sm text-ember-soft">Read →</span>
      </div>
    </Link>
  );
}
