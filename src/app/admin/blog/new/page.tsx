import Link from "next/link";
import PostForm from "../PostForm";

export default function NewPost() {
  return (
    <>
      <Link href="/admin/blog" className="kicker hover:text-ink">← Blog</Link>
      <h1 className="h-display mt-3 mb-8 text-4xl">New post</h1>
      <PostForm />
    </>
  );
}
