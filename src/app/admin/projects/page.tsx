import Link from "next/link";
import { listAdminProjects } from "@/lib/admin-projects";
import StatusBadge from "@/components/projects/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminProjects() {
  const projects = await listAdminProjects();
  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <h1 className="h-display text-5xl">Projects</h1>
        <Link href="/admin/projects/new" className="btn">+ New project</Link>
      </div>
      <ul className="surface mt-8 divide-y divide-line sm:hidden">
        {projects.map((p) => (
          <li key={p.slug} className="flex flex-col gap-3 px-5 py-4">
            <div>
              <p>{p.title}</p>
              <p className="font-mono text-xs text-muted">{p.slug}</p>
            </div>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <StatusBadge status={p.status} />
              <span className={`font-mono text-xs ${p.visibility === "published" ? "text-brass-soft" : "text-muted"}`}>{p.visibility}</span>
            </p>
            <div className="flex gap-3">
              <Link href={`/admin/projects/${p.slug}`} className="btn-ghost py-2">Edit</Link>
              {p.visibility === "published" && <Link href={`/projects/${p.slug}`} className="btn-ghost py-2">View ↗</Link>}
            </div>
          </li>
        ))}
      </ul>
      <div className="surface mt-8 hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-muted">
            <tr className="border-b border-line">
              <th className="px-5 py-3 font-normal">Order</th>
              <th className="px-5 py-3 font-normal">Title</th>
              <th className="px-5 py-3 font-normal">Status</th>
              <th className="px-5 py-3 font-normal">Visibility</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.slug} className="border-b border-line last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3 font-mono text-muted">{p.sortOrder}</td>
                <td className="px-5 py-3">
                  <p>{p.title}</p>
                  <p className="font-mono text-xs text-muted">{p.slug}</p>
                </td>
                <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                <td className={`px-5 py-3 font-mono text-xs ${p.visibility === "published" ? "text-brass-soft" : "text-muted"}`}>{p.visibility}</td>
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  <Link href={`/admin/projects/${p.slug}`} className="text-ember-soft hover:underline">Edit</Link>
                  {p.visibility === "published" && (
                    <Link href={`/projects/${p.slug}`} className="ml-4 text-muted hover:text-ink">View ↗</Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
