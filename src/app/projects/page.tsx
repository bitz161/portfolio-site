import Link from "next/link";
import { getProjects } from "@/lib/projects";
import { TrackBadge, StatusBadge, TypeBadge, SkillTag } from "@/components/Badge";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-serif text-4xl font-black tracking-tight text-foreground-bright sm:text-5xl">
        Projects
      </h1>
      <p className="mt-4 max-w-xl text-muted">
        Three chained database projects: model the data, pipe real data into
        it, then tune it under load.
      </p>

      <ul className="mt-14 divide-y divide-border-soft border-t-2 border-border">
        {projects.map((project, i) => (
          <li key={project.slug}>
            <Link href={`/projects/${project.slug}`} className="group grid gap-4 py-8 sm:grid-cols-[auto_1fr_auto] sm:items-start">
              <div className="font-serif text-sm font-bold text-accent">
                0{i + 1}
              </div>
              <div>
                <TrackBadge track={project.track} />
                <h2 className="mt-2 font-serif text-2xl font-bold text-foreground-bright group-hover:text-accent">
                  {project.title}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                  {project.summary}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.skills.map((skill) => (
                    <SkillTag key={skill} skill={skill} />
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <StatusBadge status={project.status} />
                <TypeBadge contentType={project.contentType} codeLanguage={project.codeLanguage} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
