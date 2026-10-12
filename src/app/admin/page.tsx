import Link from "next/link";
import { listAdminProjects } from "@/lib/admin-projects";
import { listAdminPosts } from "@/lib/admin-blog";
import { getAllUsedSkills } from "@/lib/skill-categories";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [projects, posts, skills] = await Promise.all([listAdminProjects(), listAdminPosts(), getAllUsedSkills()]);
  const cards = [
    { href: "/admin/projects", title: "Projects", n: projects.length, sub: `${projects.filter((p) => p.visibility === "published").length} published`, cta: { href: "/admin/projects/new", label: "New project" } },
    { href: "/admin/blog", title: "Blog", n: posts.length, sub: `${posts.filter((p) => p.status === "published").length} published`, cta: { href: "/admin/blog/new", label: "New post" } },
    { href: "/admin/skills", title: "Skills", n: skills.length, sub: "used across projects" },
  ];
  return (
    <>
      <h1 className="h-display text-5xl">Control room.</h1>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.href} className="surface flex flex-col p-6">
            <Link href={c.href} className="group">
              <p className="label">{c.title}</p>
              <p className="mt-3 font-display text-6xl">{c.n}</p>
              <p className="text-sm text-muted">{c.sub}</p>
            </Link>
            <div className="mt-6 flex gap-2">
              <Link href={c.href} className="btn-ghost py-2">Manage</Link>
              {c.cta && <Link href={c.cta.href} className="btn py-2">{c.cta.label}</Link>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
