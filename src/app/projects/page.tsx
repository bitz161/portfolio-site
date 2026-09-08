import Link from "next/link";
import { getProjects } from "@/lib/projects";
import { StatusBadge, TypeBadge, SkillTag } from "@/components/Badge";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <span className="kicker">All work</span>
      <h1 className="mt-4 font-serif text-4xl font-bold text-foreground-bright sm:text-5xl">
        Projects
      </h1>
      <p className="mt-4 max-w-xl text-muted">
        Three chained database projects: model the data, pipe real data into
        it, then tune it under load.
      </p>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {projects.map((project, i) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="card-brutal group flex flex-col justify-between bg-card p-6 text-foreground transition-transform hover:-translate-y-1"
          >
            <div>
              <div className="font-serif text-sm text-accent italic">
                0{i + 1}
              </div>
              <h2 className="mt-2 text-2xl leading-tight font-semibold text-foreground-bright">
                {project.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {project.summary}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.skills.map((skill) => (
                  <SkillTag key={skill} skill={skill} />
                ))}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <StatusBadge status={project.status} />
              <TypeBadge contentType={project.contentType} codeLanguage={project.codeLanguage} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
