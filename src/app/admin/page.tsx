import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-4xl text-foreground-bright">Admin</h1>
      <p className="mt-3 text-sm text-muted">Only reachable from the tailnet.</p>

      <div className="mt-10 space-y-4">
        <Link
          href="/admin/projects"
          className="card-brutal-sm block bg-card px-5 py-4 transition-transform hover:-translate-y-0.5"
        >
          <p className="font-bold text-foreground-bright">Manage Projects</p>
          <p className="mt-1 text-sm text-muted">
            Edit visibility, progress, and content of existing projects.
          </p>
        </Link>
        <Link
          href="/admin/new"
          className="card-brutal-sm block bg-card px-5 py-4 transition-transform hover:-translate-y-0.5"
        >
          <p className="font-bold text-foreground-bright">Add Project</p>
          <p className="mt-1 text-sm text-muted">
            Create a new project from Docs, a Jupyter Notebook, or a code snippet.
          </p>
        </Link>
      </div>
    </div>
  );
}
