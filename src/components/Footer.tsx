export default function Footer() {
  return (
    <footer className="border-t border-border bg-card text-muted">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span>Built and self-hosted on a home Ubuntu/Docker server.</span>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] tracking-[0.1em] uppercase">
          <a href="mailto:josuegarciaii@yahoo.com" className="text-muted/70 transition-colors hover:text-accent">
            Email
          </a>
          <a
            href="https://www.linkedin.com/in/josue-garcia-47597b180"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted/70 transition-colors hover:text-accent"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/bitz161/portfolio-site"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted/70 transition-colors hover:text-accent"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
