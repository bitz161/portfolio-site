import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { getProject, getProjects } from "@/lib/projects";
import { accentOf, formatDate } from "@/lib/site";
import { Reveal } from "@/components/motion/primitives";
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
  const accent = accentOf(slug);

  return (
    <article className="shell pt-28 pb-16">
      <Link href="/projects" className="kicker transition-colors hover:text-ink">← All work</Link>

      {/* Hero: the tile from the grid morphs into this card */}
      <ViewTransition name={`project-${slug}`} share="morph" default="none">
        <header
          className="surface relative mt-6 overflow-hidden p-8 sm:p-12"
          style={{ background: `linear-gradient(160deg, color-mix(in srgb, ${accent} 22%, transparent), rgb(255 255 255 / 0.02) 65%)` }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={project.status} />
            <span className="kicker">{project.track}</span>
          </div>
          <h1 className="h-display mt-8 max-w-4xl text-[clamp(2.4rem,6vw,4.8rem)]">{project.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{project.summary}</p>
        </header>
      </ViewTransition>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          {project.description && project.description !== project.summary && (
            <Reveal>
              <p className="mb-10 border-l-2 border-ember pl-5 text-lg leading-relaxed text-ink/85">{project.description}</p>
            </Reveal>
          )}

          {project.metricBefore && project.metricAfter && (
            <Reveal className="mb-12 max-w-md">
              <p className="label mb-4">Result</p>
              <MetricCard before={project.metricBefore} after={project.metricAfter} label={project.metricLabel} />
            </Reveal>
          )}

          {project.imageKey && (
            <Reveal className="relative mb-12 aspect-video overflow-hidden rounded-2xl border border-line">
              <Image src={`/api/files/${project.imageKey}`} alt={`${project.title} screenshot`} fill sizes="(min-width: 1024px) 760px, 100vw" className="object-cover" />
            </Reveal>
          )}

          {project.details ? (
            <Markdown>{project.details}</Markdown>
          ) : (
            <p className="surface p-6 text-muted">The write-up for this one is still being drafted.</p>
          )}
        </div>

        {/* Rail */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="surface p-6">
            <p className="label">Project chain</p>
            <ol className="mt-4 space-y-1">
              {all.map((p, i) => (
                <li key={p.slug}>
                  <Link
                    href={`/projects/${p.slug}`}
                    prefetch
                    aria-current={p.slug === slug ? "page" : undefined}
                    className={`flex gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors ${p.slug === slug ? "bg-white/8 text-ink" : "text-muted hover:text-ink"}`}
                  >
                    <span className="font-mono text-xs leading-5 opacity-60">{String(i + 1).padStart(2, "0")}</span>
                    <span className="line-clamp-2">{p.title}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          {project.skills?.length > 0 && (
            <div className="surface mt-4 p-6">
              <p className="label">Stack</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.skills.map((s) => (
                  <li key={s} className="chip">{s}</li>
                ))}
              </ul>
            </div>
          )}

          {project.links.length > 0 && (
            <div className="surface mt-4 p-6">
              <p className="label">Links</p>
              <ul className="mt-4 space-y-2 text-sm">
                {project.links.map((l) => (
                  <li key={l.url}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-ember-soft underline-offset-4 hover:underline">
                      {l.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-4 px-2 font-mono text-xs text-muted">Updated {formatDate(project.updatedAt)}</p>
        </aside>
      </div>

      {/* Prev / next */}
      <nav aria-label="More projects" className="mt-20 grid gap-4 border-t border-line pt-10 sm:grid-cols-2">
        {prev ? (
          <Link href={`/projects/${prev.slug}`} prefetch className="group surface p-6 transition-colors hover:border-white/20">
            <span className="kicker">← Previous</span>
            <p className="mt-2 font-display text-2xl transition-transform duration-300 ease-std group-hover:-translate-x-1">{prev.title}</p>
          </Link>
        ) : <span />}
        {next && (
          <Link href={`/projects/${next.slug}`} prefetch className="group surface p-6 text-right transition-colors hover:border-white/20">
            <span className="kicker">Next →</span>
            <p className="mt-2 font-display text-2xl transition-transform duration-300 ease-std group-hover:translate-x-1">{next.title}</p>
          </Link>
        )}
      </nav>
    </article>
  );
}
