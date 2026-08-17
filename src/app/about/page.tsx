export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <span className="chip-brutal bg-accent-lime">About</span>
      <h1 className="mt-5 font-serif text-4xl text-foreground-bright sm:text-5xl">
        Bitz Garcia
      </h1>
      <p className="mt-7 text-lg leading-8 text-muted">
        I build and operate data infrastructure end to end — from schema
        design through pipelines to production tuning — and self-host the
        stack that runs it. This site is the delivery layer for that work:
        real datasets, real queries, real infrastructure decisions.
      </p>
      <p className="mt-4 leading-7 text-muted">
        Everything here is backed by a real MySQL database, not mock data —
        projects, blog posts, and the pipeline that feeds them all read and
        write against the same home-lab stack listed below.
      </p>

      <div className="card-brutal mt-12 bg-card p-6">
        <p className="text-xs font-bold tracking-wide text-foreground uppercase">
          Home lab stack
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["MySQL 8.4", "MinIO", "Airflow", "JupyterLab", "Uptime Kuma", "Tailscale"].map(
            (tool) => (
              <span key={tool} className="chip-brutal font-normal normal-case tracking-normal">
                {tool}
              </span>
            ),
          )}
        </div>
      </div>

      <p className="mt-8 text-sm text-muted">
        This site is self-hosted, so it occasionally goes offline for
        maintenance. If it&apos;s down,{" "}
        <a
          href="https://bitz161.github.io/portfolio-status/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline underline-offset-2 hover:opacity-80"
        >
          here&apos;s how to reach me
        </a>
        .
      </p>
    </div>
  );
}
