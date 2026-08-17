import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getProject } from "@/lib/projects";
import { TrackBadge, StatusBadge, TypeBadge, SkillTag } from "@/components/Badge";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage(
  props: PageProps<"/projects/[slug]">,
) {
  const { slug } = await props.params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/projects"
        className="text-sm font-semibold tracking-wide text-muted uppercase transition-colors hover:text-accent"
      >
        &larr; All projects
      </Link>

      <div className="mt-8">
        <TrackBadge track={project.track} />
      </div>
      <h1 className="mt-3 font-serif text-4xl text-foreground-bright sm:text-5xl">
        {project.title}
      </h1>

      <p className="mt-7 text-lg leading-8 text-muted">
        {project.description}
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <StatusBadge status={project.status} />
        <TypeBadge contentType={project.contentType} codeLanguage={project.codeLanguage} />
        {project.skills.map((skill) => (
          <SkillTag key={skill} skill={skill} />
        ))}
      </div>

      {project.links.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-4">
          {project.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
            >
              {link.label} &rarr;
            </a>
          ))}
        </div>
      )}

      {project.details ? (
        <div className="card-brutal prose prose-headings:font-serif prose-a:text-accent prose-strong:text-foreground-bright prose-code:before:content-none prose-code:after:content-none prose-pre:card-brutal-sm prose-pre:bg-foreground-bright prose-code:rounded-none prose-img:card-brutal-sm mt-14 max-w-none bg-card p-8">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {project.details}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="card-brutal-sm mt-14 bg-card p-6 text-sm text-muted">
          <p className="font-serif text-base text-foreground">
            Coming soon
          </p>
          <p className="mt-1">
            Placeholder content — ERD, schema, and query results will replace
            this once the project is built and the API is wired up.
          </p>
        </div>
      )}
    </div>
  );
}
