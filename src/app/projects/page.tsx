import Image from "next/image";
import Link from "next/link";
import { getProjects } from "@/lib/projects";
import { StatusBadge, TypeBadge, SkillTag } from "@/components/Badge";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
      <span className="kicker">All work</span>
      <h1 className="mt-4 font-serif text-foreground-bright text-[clamp(2rem,5vw,3.5rem)] leading-[0.92]">
        Projects
      </h1>
      <p className="mt-4 max-w-xl border-l-4 border-accent pl-4 text-sm leading-relaxed text-muted">
        Chained database projects: model the data, pipe real data into
        it, then tune it under load.
      </p>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {projects.map((project, i) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="card-brutal group flex flex-col justify-between text-foreground transition-transform hover:-translate-y-1"
          >
            <div className="relative h-48 overflow-hidden border-b-2 border-foreground-bright">
              {project.imageKey ? (
                <Image
                  src={`/api/files/${project.imageKey}`}
                  alt={`${project.title} screenshot`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-foreground-bright">
                  <span className="font-serif text-4xl font-black text-background/20">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col justify-between p-6">
              <div>
                <div className="font-serif text-sm text-accent italic">0{i + 1}</div>
                <h2 className="mt-2 text-2xl leading-tight font-semibold text-foreground-bright">
                  {project.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted">{project.summary}</p>
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
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
