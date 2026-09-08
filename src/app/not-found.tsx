import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <span className="chip-brutal bg-accent-danger">404</span>
      <h1 className="mt-5 font-serif text-4xl text-foreground-bright sm:text-5xl">
        Empty set.
      </h1>
      <p className="mt-7 text-lg leading-8 text-muted">
        That page doesn&apos;t exist — or it never did.
      </p>

      <div className="card-brutal mt-8 bg-card p-6 font-mono text-sm">
        <p className="text-muted">
          <span className="text-accent-danger">mysql&gt;</span> SELECT * FROM pages WHERE path = &apos;this one&apos;;
        </p>
        <p className="mt-2 text-muted">Empty set (0.00 sec)</p>
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/" className="btn-pill">
          Home
          <span className="btn-pill-icon" aria-hidden>
            &rarr;
          </span>
        </Link>
        <Link href="/projects" className="btn-pill-ghost">
          Projects
          <span className="btn-pill-icon" aria-hidden>
            &rarr;
          </span>
        </Link>
      </div>
    </div>
  );
}
