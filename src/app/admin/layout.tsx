import Link from "next/link";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/skills", label: "Skills" },
];

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="shell pt-28 pb-16">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <p className="label">Admin · tailnet only</p>
        <nav className="flex flex-wrap gap-1">
          {TABS.map((t) => (
            <Link key={t.href} href={t.href} className="rounded-full px-4 py-2 text-sm text-muted transition-colors hover:bg-white/5 hover:text-ink">
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
