"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";

const LINKS = [
  { href: "/projects", label: "Work" },
  { href: "/blog", label: "Writing" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // middleware.ts only lets tailnet requests reach /api/admin/*, so a 200 means "show Admin".
  useEffect(() => {
    fetch("/api/admin/whoami").then((r) => setIsAdmin(r.ok), () => {});
  }, []);

  const links = isAdmin ? [...LINKS, { href: "/admin", label: "Admin" }] : LINKS;
  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="site-head">
      <nav className="shell" aria-label="Main">
        <Link href="/" onClick={() => setOpen(false)}>Josue Garcia</Link>
        <button className="nav-toggle" aria-expanded={open} aria-controls="nav-links" onClick={() => setOpen((o) => !o)}>
          {open ? "Close" : "Menu"}
        </button>
        <div id="nav-links" className="nav-links" data-open={open}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={active(l.href) ? "page" : undefined} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <a href={`mailto:${SITE.email}`}>Contact</a>
        </div>
      </nav>
    </header>
  );
}
