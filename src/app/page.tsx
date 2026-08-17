import Link from "next/link";
import { getProjects } from "@/lib/projects";
import { StatusBadge } from "@/components/Badge";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = (await getProjects()).slice(0, 3);
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <div className="mb-5 flex items-center gap-2.5 text-xs font-bold tracking-widest text-accent uppercase">
        <span className="h-0.5 w-7 bg-accent" />
        Self-hosted portfolio
      </div>

      <h1 className="font-serif text-6xl leading-[0.98] font-black tracking-tight text-foreground-bright sm:text-7xl">
        Data &amp;
        <br />
        <em className="text-accent italic">Database</em>
        <br />
        Craft.
      </h1>

      <p className="mt-8 max-w-xl text-lg leading-8 text-muted">
        Hands-on projects in data modeling, pipelines, and database
        operations — chained together around one real-world dataset, from
        raw ingestion to a tuned, production-shaped schema.
      </p>

      <div className="mt-9 flex gap-4">
        <Link
          href="/projects"
          className="bg-foreground-bright px-6 py-3.5 text-sm font-bold tracking-wide text-background uppercase transition-opacity hover:opacity-90"
        >
          View Projects
        </Link>
        <Link
          href="/about"
          className="border-2 border-foreground px-6 py-3.5 text-sm font-bold tracking-wide text-foreground uppercase transition-colors hover:border-accent hover:text-accent"
        >
          About Me
        </Link>
      </div>

      <div className="mt-20 grid grid-cols-1 border-t-2 border-border sm:grid-cols-3">
        {projects.map((project, i) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className={`group p-7 ${i < projects.length - 1 ? "border-border-soft sm:border-r" : ""} border-b border-border-soft sm:border-b-0`}
          >
            <div className="font-serif text-sm font-bold text-accent">
              0{i + 1}
            </div>
            <h2 className="mt-3 font-serif text-2xl font-bold text-foreground-bright group-hover:text-accent">
              {project.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              {project.summary}
            </p>
            <div className="mt-5">
              <StatusBadge status={project.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
