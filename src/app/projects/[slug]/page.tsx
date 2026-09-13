import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getProject, getProjects, type ProjectStatus } from "@/lib/projects";
import { StatusBadge, TypeBadge, SkillTag } from "@/components/Badge";
import ProjectSelectorStrip from "./ProjectSelectorStrip";

export const dynamic = "force-dynamic";

const statusBadgeClass: Record<ProjectStatus, string> = {
  "not-started": "badge-not-started",
  "in-progress": "badge-in-progress",
  done: "badge-done",
};

export default async function ProjectDetailPage(props: PageProps<"/projects/[slug]">) {
  const { slug } = await props.params;
  const [project, allProjects] = await Promise.all([getProject(slug), getProjects()]);

  if (!project) {
    notFound();
  }

  // Same signal layout.tsx uses to show the Admin nav link -- only present
  // on tailnet-authenticated requests, never on public Funnel traffic.
  const isDev = process.env.NODE_ENV === "development";
  const hdrs = await headers();
  const isAdmin = isDev || hdrs.has("tailscale-user-login");

  return (
    <div>
      {/* Project selector strip -- every real project, current one highlighted */}
      <ProjectSelectorStrip projects={allProjects} activeSlug={slug} />

      {/* Cover image with status overlay */}
      <div className="relative h-56 overflow-hidden border-b-2 border-foreground-bright sm:h-72">
        {project.imageKey ? (
          <Image
            src={`/api/files/${project.imageKey}`}
            alt={`${project.title} screenshot`}
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-foreground-bright" />
        )}
        <div className="absolute inset-0 bg-foreground-bright/40" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-6 pb-8 sm:px-8">
            <StatusBadge status={project.status} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            <h1 className="font-serif text-foreground-bright mb-3 text-3xl leading-tight sm:text-4xl">
              {project.title}
            </h1>
            <p className="mb-8 font-mono text-sm text-muted">{project.track}</p>
            <p className="mb-10 border-l-4 border-foreground-bright pl-4 text-base leading-relaxed text-muted">
              {project.description}
            </p>

            {project.metricBefore && project.metricAfter && (
              <div className="mb-12 border-2 border-foreground-bright">
                <div className="bg-foreground-bright px-6 py-3 text-background">
                  <span className="font-mono text-xs font-bold tracking-widest uppercase">
                    Performance Result{project.metricLabel ? ` · ${project.metricLabel}` : ""}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <div className="border-r-2 border-foreground-bright bg-background px-6 py-8 text-center">
                    <span className="mb-3 block font-mono text-xs font-bold tracking-widest text-muted uppercase">
                      Before
                    </span>
                    <span className="font-serif text-foreground-bright block text-4xl sm:text-5xl">
                      {project.metricBefore}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center border-r-2 border-foreground-bright bg-accent px-4 py-8 text-center">
                    <div className="text-2xl text-white">&rarr;</div>
                  </div>
                  <div className="bg-background px-6 py-8 text-center">
                    <span className="mb-3 block font-mono text-xs font-bold tracking-widest text-muted uppercase">
                      After
                    </span>
                    <span className="font-serif text-accent block text-4xl sm:text-5xl">
                      {project.metricAfter}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6 flex items-center gap-3">
              <TypeBadge contentType={project.contentType} codeLanguage={project.codeLanguage} />
              <span className="font-mono text-xs text-muted">
                Last updated{" "}
                {project.updatedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>

            {project.details ? (
              <div className="prose prose-headings:font-serif prose-a:text-accent prose-strong:text-foreground-bright prose-code:before:content-none prose-code:after:content-none prose-pre:border-2 prose-pre:border-foreground-bright prose-pre:bg-foreground-bright prose-code:rounded-none prose-img:border-2 prose-img:border-foreground-bright max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {project.details}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="border-2 border-foreground-bright bg-border-soft/30 p-6 text-sm text-muted">
                <p className="font-serif text-foreground-bright text-base">Coming soon</p>
                <p className="mt-1">
                  Placeholder content &mdash; ERD, schema, and query results will replace
                  this once the writeup is added.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 flex flex-col gap-6">
              {/* Project info */}
              <div className="border-2 border-foreground-bright bg-background">
                <div className="bg-foreground-bright px-5 py-3 text-background">
                  <span className="font-mono text-xs font-bold tracking-widest uppercase">Project Info</span>
                </div>
                <div className="flex flex-col gap-4 p-5">
                  <div>
                    <span className="mb-1 block font-mono text-xs tracking-widest text-muted uppercase">Status</span>
                    <StatusBadge status={project.status} />
                  </div>

                  {project.links.length > 0 && (
                    <div>
                      <span className="mb-2 block font-mono text-xs tracking-widest text-muted uppercase">Links</span>
                      <div className="flex flex-col gap-2">
                        {project.links.map((link) => (
                          <a
                            key={link.url}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 border border-foreground-bright px-3 py-2 font-mono text-xs font-bold transition-colors hover:bg-foreground-bright hover:text-background"
                          >
                            {link.label} &rarr;
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="mb-2 block font-mono text-xs tracking-widest text-muted uppercase">Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.skills.map((skill) => (
                        <SkillTag key={skill} skill={skill} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Project chain */}
              <div className="border-2 border-foreground-bright bg-border-soft/30">
                <div className="bg-accent px-5 py-3 text-white">
                  <span className="font-mono text-xs font-bold tracking-widest uppercase">Project Chain</span>
                </div>
                <div className="flex flex-col gap-2 p-5">
                  {allProjects.map((p, idx) => (
                    <Link
                      key={p.slug}
                      href={`/projects/${p.slug}`}
                      className={`flex items-center gap-3 border border-foreground-bright px-3 py-2 font-mono text-xs transition-colors ${
                        p.slug === slug ? "bg-foreground-bright text-background" : "bg-background hover:bg-border-soft/50"
                      }`}
                    >
                      <span className="opacity-40">{String(idx + 1).padStart(2, "0")}</span>
                      <span className="font-bold">{p.title}</span>
                      <span className={`ml-auto px-1.5 py-0.5 text-[10px] ${statusBadgeClass[p.status]}`}>
                        {p.status}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {isAdmin && (
                <Link
                  href={`/admin/projects/${slug}`}
                  className="border-2 border-accent bg-accent px-4 py-3 text-center font-mono text-xs font-bold tracking-widest text-white uppercase transition-opacity hover:opacity-85"
                >
                  Edit Project
                </Link>
              )}

              <Link
                href="/projects"
                className="border border-foreground-bright px-4 py-3 text-center font-mono text-xs font-bold tracking-widest uppercase transition-colors hover:bg-foreground-bright hover:text-background"
              >
                &larr; Back to Portfolio
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
