"use client";

import { useState } from "react";
import Link from "next/link";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Writing" },
  { href: "/gallery", label: "Gallery" },
];

export default function NavBar({ isAdmin = false }: { isAdmin?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = isAdmin ? [...links, { href: "/admin", label: "Admin" }] : links;

  return (
    <header className="border-b border-foreground-bright bg-background">
      {/* Thick masthead rule, top of every page. */}
      <div className="h-1 bg-foreground-bright" />

      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="relative flex h-14 items-center justify-between border-b border-foreground-bright md:border-b-0">
          <span className="folio-label hidden md:block">Portfolio &middot; 2026</span>

          <Link
            href="/"
            className="font-serif text-sm uppercase tracking-[0.2em] text-foreground-bright md:absolute md:left-1/2 md:-translate-x-1/2"
          >
            Josue Garcia
          </Link>

          <nav className="hidden md:flex items-center gap-0">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="ink-hover border-l border-foreground-bright px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-foreground-bright"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://github.com/bitz161/portfolio-site"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent ml-3"
            >
              GitHub
              <span aria-hidden>&#8599;</span>
            </a>
          </nav>

          <button
            className="flex flex-col gap-1.5 p-2 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <span
              className="block h-px w-5 bg-foreground-bright transition-transform"
              style={{ transform: mobileOpen ? "rotate(45deg) translate(1px, 4px)" : "none" }}
            />
            <span
              className="block h-px w-5 bg-foreground-bright transition-opacity"
              style={{ opacity: mobileOpen ? 0 : 1 }}
            />
            <span
              className="block h-px w-5 bg-foreground-bright transition-transform"
              style={{ transform: mobileOpen ? "rotate(-45deg) translate(1px, -4px)" : "none" }}
            />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-b border-foreground-bright bg-background md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="ink-hover block border-b border-foreground-bright px-6 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-foreground-bright"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://github.com/bitz161/portfolio-site"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            className="block bg-accent px-6 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-white"
          >
            GitHub &#8599;
          </a>
        </div>
      )}
    </header>
  );
}
