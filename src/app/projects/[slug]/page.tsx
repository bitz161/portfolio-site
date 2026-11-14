import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getProjects } from "@/lib/projects";
import { formatDate } from "@/lib/site";
import { Letters, Reveal } from "@/components/motion/primitives";
import StatusBadge from "@/components/projects/StatusBadge";
import MetricCard from "@/components/projects/MetricCard";
import Markdown from "@/components/Markdown";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const project = await getProject((await props.params).slug);
  return project ? { title: project.title, description: project.summary } : {};
}

export default async function ProjectPage(props: PageProps<"/projects/[slug]">) {
  const { slug } = await props.params;
  const [project, all] = await Promise.all([getProject(slug), getProjects()]);
  if (!project) notFound();

  const idx = all.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

  return (
    <article className="pt-32">
      <header className="shell">
        <h1 className="t-title"><Letters text={project.title} step={0.012} onLoad /></h1>
        <p className="t-lead fade-in mt-8 max-w-[52ch]" style={{ "--d": "350ms" } as React.CSSProperties}>{project.summary}</p>
      </header>

      <div className="shell about detail mt-16">
        {/* Side facts */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <dl className="grid max-w-[300px] gap-4">
            <div>
              <dt className="soft">Status</dt>
              <dd><StatusBadge status={project.status} /></dd>
            </div>
            <div>
              <dt className="soft">Track</dt>
              <dd>{project.track}</dd>
            </div>
            <div>
              <dt className="soft">Updated</dt>
              <dd>{formatDate(project.updatedAt)}</dd>
            </div>
            {project.skills?.length > 0 && (
              <div>
                <dt className="soft">Stack</dt>
                <dd>{project.skills.join(", ")}</dd>
              </div>
            )}
            {project.links.length > 0 && (
              <div>
                <dt className="soft">Links</dt>
                {project.links.map((l) => (
                  <dd key={l.url}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="link">{l.label}</a>
                  </dd>
                ))}
              </div>
            )}
          </dl>

          <nav aria-label="Project chain" className="mt-10 hidden max-w-[300px] lg:block">
            <p className="soft">Project chain</p>
            <ol className="mt-2">
              {all.map((p) => (
                <li key={p.slug}>
                  <Link href={`/projects/${p.slug}`} prefetch aria-current={p.slug === slug ? "page" : undefined} className={`block py-2 transition-colors ${p.slug === slug ? "font-medium text-ink" : "text-muted hover:text-ink"}`}>
                    {p.title}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="min-w-0">
          {project.description && project.description !== project.summary && (
            <Reveal>
              <p className="t-lead mb-12">{project.description}</p>
            </Reveal>
          )}

          {project.metricBefore && project.metricAfter && (
            <Reveal className="mb-12">
              <MetricCard before={project.metricBefore} after={project.metricAfter} label={project.metricLabel} />
            </Reveal>
          )}

          {project.imageKey && (
            <Reveal className="field relative mb-12 aspect-video overflow-hidden">
              <Image src={`/api/files/${project.imageKey}`} alt={`${project.title} screenshot`} fill sizes="(min-width: 1024px) 760px, 100vw" className="object-cover" />
            </Reveal>
          )}

          {project.details ? <Markdown>{project.details}</Markdown> : <p className="field p-6">The write-up for this one is still being drafted.</p>}
        </div>
      </div>

      {/* Previous / next, as display rows */}
      <nav aria-label="More projects" className="rows mt-[calc(var(--gap)/2)]">
        {prev && (
          <Link href={`/projects/${prev.slug}`} prefetch>
            <span className="t-head font-normal">← {prev.title}</span>
          </Link>
        )}
        {next && (
          <Link href={`/projects/${next.slug}`} prefetch>
            <span className="t-head font-normal">{next.title} →</span>
          </Link>
        )}
        <Link href="/projects">
          <span className="t-head font-normal">All work</span>
        </Link>
      </nav>
    </article>
  );
}
