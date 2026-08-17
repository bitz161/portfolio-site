import Link from "next/link";
import { getProjects } from "@/lib/projects";
import { StatusBadge } from "@/components/Badge";

export const dynamic = "force-dynamic";

const CARD_COLORS = ["bg-accent-warm", "bg-accent-danger", "bg-accent-teal"];

export default async function Home() {
  const projects = (await getProjects()).slice(0, 3);
  return (
    <div>
      <section className="border-b-[3px] border-border bg-accent px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <span className="chip-brutal bg-background">Self-hosted portfolio</span>

          <h1 className="mt-6 font-serif text-5xl leading-[1.05] text-white sm:text-7xl">
            Data &amp; Database
            <br />
            Craft.
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-white/90">
            Hands-on projects in data modeling, pipelines, and database
            operations — chained together around one real-world dataset, from
            raw ingestion to a tuned, production-shaped schema.
          </p>

          <div className="mt-9 flex gap-4">
            <Link
              href="/projects"
              className="card-brutal-sm bg-background px-6 py-3.5 text-sm font-bold tracking-wide text-foreground uppercase transition-transform hover:-translate-y-0.5"
            >
              View Projects
            </Link>
            <Link
              href="/about"
              className="card-brutal-sm bg-accent-lime px-6 py-3.5 text-sm font-bold tracking-wide text-foreground uppercase transition-transform hover:-translate-y-0.5"
            >
              About Me
            </Link>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-b-[3px] border-border bg-accent-lime py-2">
        <div className="whitespace-nowrap text-sm font-bold tracking-wide uppercase">
          {"MySQL • Airflow • MinIO • Metabase • Tailscale • Docker • ".repeat(6)}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="font-serif text-2xl text-foreground-bright sm:text-3xl">
          Featured projects
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {projects.map((project, i) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className={`card-brutal group flex flex-col justify-between p-6 text-foreground-bright transition-transform hover:-translate-y-1 ${CARD_COLORS[i % CARD_COLORS.length]}`}
            >
              <div>
                <div className="font-serif text-sm">0{i + 1}</div>
                <h3 className="mt-2 text-xl leading-tight font-bold">
                  {project.title}
                </h3>
                <p className="mt-3 text-sm leading-6">{project.summary}</p>
              </div>
              <div className="mt-5">
                <StatusBadge status={project.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
