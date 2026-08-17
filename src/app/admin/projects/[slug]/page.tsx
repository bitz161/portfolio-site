import { notFound } from "next/navigation";
import { getAdminProject } from "@/lib/admin-projects";
import EditProjectForm from "./EditProjectForm";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getAdminProject(slug);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-4xl text-foreground-bright">Edit Project</h1>
      <p className="mt-3 text-sm text-muted">
        {project.contentType === "docs"
          ? "Docs project"
          : project.contentType === "notebook"
            ? "Notebook-derived project"
            : `Code snippet (${project.codeLanguage})`}{" "}
        — content is edited as Markdown regardless of how it was created.
      </p>
      <EditProjectForm project={project} />
    </div>
  );
}
