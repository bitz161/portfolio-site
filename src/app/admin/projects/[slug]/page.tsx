import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminProject } from "@/lib/admin-projects";
import ProjectForm from "../ProjectForm";
import ProjectExtras from "./ProjectExtras";

export const dynamic = "force-dynamic";

export default async function EditProject(props: PageProps<"/admin/projects/[slug]">) {
  const { slug } = await props.params;
  const project = await getAdminProject(slug);
  if (!project) notFound();
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/projects" className="kicker hover:text-ink">← Projects</Link>
          <h1 className="h-display mt-3 text-4xl">{project.title}</h1>
        </div>
        {project.visibility === "published" && <Link href={`/projects/${slug}`} className="btn-ghost">View live ↗</Link>}
      </div>
      <div className="mt-8 space-y-6">
        <ProjectExtras slug={slug} imageKey={project.imageKey} links={project.links} />
        <ProjectForm mode={{ kind: "edit", project }} />
      </div>
    </>
  );
}
