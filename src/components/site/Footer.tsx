import Link from "next/link";
import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="shell flex flex-col gap-6 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-3xl">
            Josue Garcia<span className="text-ember">.</span>
          </p>
          <p className="mt-2 text-sm text-muted">Self-hosted on a home server: Docker, MySQL, MinIO, Tailscale.</p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <li><Link className="transition-colors hover:text-ink" href="/projects">Work</Link></li>
          <li><Link className="transition-colors hover:text-ink" href="/blog">Writing</Link></li>
          <li><Link className="transition-colors hover:text-ink" href="/about">About</Link></li>
          <li><a className="transition-colors hover:text-ink" href={SITE.github} target="_blank" rel="noopener noreferrer">GitHub</a></li>
          <li><a className="transition-colors hover:text-ink" href={SITE.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          <li><a className="transition-colors hover:text-ink" href={`mailto:${SITE.email}`}>Email</a></li>
        </ul>
      </div>
      <p className="shell pb-8 font-mono text-xs text-muted">
        © 2026 · If this site is down,{" "}
        <a className="text-steel-soft underline underline-offset-4" href={SITE.statusPage}>here is how to reach me</a>.
      </p>
    </footer>
  );
}
