import Link from "next/link";
import ProjectForm from "../ProjectForm";

export default function NewProject() {
  return (
    <>
      <Link href="/admin/projects" className="kicker hover:text-ink">← Projects</Link>
      <h1 className="h-display mt-3 mb-8 text-4xl">New project</h1>
      <ProjectForm mode={{ kind: "create" }} />
    </>
  );
}
