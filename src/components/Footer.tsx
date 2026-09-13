import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-foreground-bright bg-foreground-bright">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="flex flex-col gap-4 border-b border-background/10 py-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono text-[11px] tracking-[0.14em] text-background/40 uppercase">
            &copy; 2026 Josue Garcia &middot; Self-hosted on Docker
          </span>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a
              href="https://github.com/bitz161/portfolio-site"
              target="_blank"
              rel="noopener noreferrer"
              className="ink-hover font-mono text-[11px] font-bold tracking-[0.14em] text-background/40 uppercase"
            >
              GitHub
            </a>
            <Link
              href="/projects"
              className="ink-hover font-mono text-[11px] font-bold tracking-[0.14em] text-background/40 uppercase"
            >
              Projects
            </Link>
            <Link
              href="/blog"
              className="ink-hover font-mono text-[11px] font-bold tracking-[0.14em] text-background/40 uppercase"
            >
              Writing
            </Link>
            <Link
              href="/about"
              className="ink-hover font-mono text-[11px] font-bold tracking-[0.14em] text-background/40 uppercase"
            >
              About
            </Link>
            <a
              href="mailto:josuegarciaii@yahoo.com"
              className="ink-hover font-mono text-[11px] font-bold tracking-[0.14em] text-background/40 uppercase"
            >
              Email
            </a>
          </div>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="font-mono text-[11px] tracking-[0.14em] text-background/20 uppercase">
            swe-2.tail174d56.ts.net
          </span>
          <span className="font-mono text-[11px] tracking-[0.14em] text-background/20 uppercase">
            Data Engineering Portfolio
          </span>
        </div>
      </div>
    </footer>
  );
}
