import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div>
      <div className="border-b-2 border-foreground-bright bg-foreground-bright text-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
          <span className="font-mono text-xs font-bold tracking-widest uppercase">Admin Panel</span>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 bg-accent" />
            <span className="font-mono text-xs text-background/60">Tailscale authenticated</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
        <span className="kicker mb-3 block">Dashboard</span>
        <h1 className="font-serif text-foreground-bright text-4xl leading-none">Content Overview</h1>
        <p className="mt-3 font-mono text-sm text-muted">Only reachable from the tailnet.</p>

        <div className="mt-10 grid grid-cols-1 gap-0 border-2 border-foreground-bright sm:grid-cols-2">
          <Link
            href="/admin/projects"
            className="border-foreground-bright bg-background p-6 transition-colors hover:bg-border-soft/40 sm:border-r-2"
          >
            <p className="font-serif text-foreground-bright text-lg">Manage Projects</p>
            <p className="mt-2 font-mono text-xs text-muted">
              Add new projects and edit visibility, progress, and content of existing ones.
            </p>
          </Link>
          <Link
            href="/admin/blog"
            className="border-t-2 border-foreground-bright bg-background p-6 transition-colors hover:bg-border-soft/40 sm:border-t-0"
          >
            <p className="font-serif text-foreground-bright text-lg">Manage Blog</p>
            <p className="mt-2 font-mono text-xs text-muted">
              Write, edit, and publish blog posts without hand-writing SQL.
            </p>
          </Link>
          <Link
            href="/admin/skills"
            className="border-t-2 border-foreground-bright bg-background p-6 transition-colors hover:bg-border-soft/40 sm:col-span-2"
          >
            <p className="font-serif text-foreground-bright text-lg">Skills &amp; Tools</p>
            <p className="mt-2 font-mono text-xs text-muted">
              Set which homepage group (Languages/Databases/Data Eng/Infra/Analysis) each skill shows under.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
