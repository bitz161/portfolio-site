import Link from "next/link";
import { listAdminProjects } from "@/lib/admin-projects";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  done: "Done",
};

export default async function AdminProjectsPage() {
  const projects = await listAdminProjects();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl text-foreground-bright">Manage Projects</h1>
        <Link href="/admin/new" className="text-sm font-semibold text-accent hover:underline">
          + Add project
        </Link>
      </div>
      <p className="mt-3 text-sm text-muted">
        Includes drafts. Editing links (removing/reordering) is still manual SQL — see PROJECTS.md.
      </p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b-2 border-border-soft text-foreground-bright">
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4">Track</th>
              <th className="py-2 pr-4">Progress</th>
              <th className="py-2 pr-4">Visibility</th>
              <th className="py-2 pr-4">Order</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-b border-border-soft/50">
                <td className="py-3 pr-4 font-semibold text-foreground-bright">{p.title}</td>
                <td className="py-3 pr-4 text-muted">{p.track}</td>
                <td className="py-3 pr-4">
                  <span className="chip-brutal">{STATUS_LABEL[p.status] ?? p.status}</span>
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={
                      p.visibility === "published"
                        ? "chip-brutal bg-accent-lime"
                        : "chip-brutal bg-card text-muted"
                    }
                  >
                    {p.visibility}
                  </span>
                </td>
                <td className="py-3 pr-4 text-muted">{p.sortOrder}</td>
                <td className="py-3 text-right">
                  <Link href={`/admin/projects/${p.slug}`} className="font-semibold text-accent hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-muted">
                  No projects yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
