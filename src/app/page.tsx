import Image from "next/image";
import Link from "next/link";
import { getProjects } from "@/lib/projects";
import { getPublishedPosts } from "@/lib/blog";
import { StatusBadge, SkillTag } from "@/components/Badge";
import { getSkillCategoryMap, SKILL_CATEGORIES, DEFAULT_CATEGORY } from "@/lib/skill-categories";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [allProjects, posts, categoryMap] = await Promise.all([
    getProjects(),
    getPublishedPosts(),
    getSkillCategoryMap(),
  ]);
  const projectCount = allProjects.length;
  const doneCount = allProjects.filter((p) => p.status === "done").length;
  const metricProject = allProjects.find((p) => p.metricBefore && p.metricAfter);
  const latestPosts = posts.slice(0, 2);

  // Group every real skill (deduped) into the editorial buckets, per the
  // category assigned in /admin/skills; anything not yet categorized falls
  // back to Analysis so no real skill silently disappears.
  const allSkills = Array.from(new Set(allProjects.flatMap((p) => p.skills)));
  const skillSections = SKILL_CATEGORIES.map((category) => ({
    category,
    skills: allSkills.filter((s) => (categoryMap[s] ?? DEFAULT_CATEGORY) === category),
  })).filter((g) => g.skills.length > 0);

  return (
    <div>
      {/* Hero — masthead cover: oversized name + stats/photo sidebar */}
      <section className="border-b border-foreground-bright">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="flex items-center justify-between border-b border-foreground-bright py-3">
            <span className="folio-label">Issue No. 01 &middot; Data Engineering</span>
            <span className="folio-label">Available for Work</span>
            <span className="folio-label hidden sm:block">Sep 2026</span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-12">
            {/* Headline + intro */}
            <div className="flex flex-col justify-between border-foreground-bright py-10 pr-0 lg:col-span-8 lg:border-r lg:pr-10">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
                Data Analyst &amp; Database Engineer
              </span>

              <div className="flex flex-1 flex-col justify-center">
                <h1 className="font-serif text-foreground-bright leading-[0.88] tracking-tight text-[clamp(3.5rem,10vw,8rem)]">
                  JOSUE
                </h1>
                <div className="my-2 h-1.5 w-full bg-accent" />
                <h1 className="font-serif text-foreground-bright leading-[0.88] tracking-tight text-[clamp(3.5rem,10vw,8rem)]">
                  GARCIA
                </h1>

                <div className="mt-8 grid grid-cols-1 gap-8 border-t border-foreground-bright pt-6 sm:grid-cols-2">
                  <p className="border-l-4 border-accent pl-5 text-sm leading-relaxed text-muted">
                    Building data systems end-to-end &mdash; normalized schemas, automated
                    ingestion pipelines, slow-query diagnosis, and index tuning.{" "}
                    {projectCount} chained projects. One connected dataset. Real results.
                  </p>
                  <div className="flex flex-col gap-4">
                    <div>
                      <span className="folio-label mb-1 block">Stack</span>
                      <p className="font-mono text-xs text-foreground-bright">
                        MySQL &middot; Apache Airflow &middot; MinIO &middot; Python &middot; Docker
                      </p>
                    </div>
                    <div>
                      <span className="folio-label mb-1 block">Live at</span>
                      <p className="font-mono text-xs text-foreground-bright">swe-2.tail174d56.ts.net</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-0 border-t border-foreground-bright pt-6 sm:flex-row">
                <Link href="/projects" className="btn-pill rounded-none">
                  View Projects
                  <span aria-hidden>&rarr;</span>
                </Link>
                <a
                  href="https://github.com/bitz161/portfolio-site"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border-l-0 border-foreground-bright bg-background px-8 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-foreground-bright transition-colors hover:border-accent hover:text-accent sm:border-l"
                >
                  GitHub &#8599;
                </a>
              </div>
            </div>

            {/* Stats sidebar + photo */}
            <div className="hidden flex-col py-10 pl-8 lg:col-span-4 lg:flex">
              <div className="mb-8">
                <span className="folio-label mb-4 block">By the Numbers</span>
                <div className="flex flex-col gap-0">
                  <div className="border-b border-foreground-bright py-4">
                    <div className="font-serif text-4xl leading-none text-foreground-bright">
                      {String(projectCount).padStart(2, "0")}
                    </div>
                    <div className="mt-1 font-mono text-[11px] font-bold uppercase tracking-widest text-foreground-bright">
                      Chained projects
                    </div>
                  </div>
                  <div className="border-b border-foreground-bright py-4">
                    <div className="font-serif text-4xl leading-none text-foreground-bright">
                      {doneCount}/{projectCount}
                    </div>
                    <div className="mt-1 font-mono text-[11px] font-bold uppercase tracking-widest text-foreground-bright">
                      Shipped and done
                    </div>
                  </div>
                  {metricProject && (
                    <div className="border-b border-foreground-bright py-4">
                      <div className="font-serif text-4xl leading-none text-foreground-bright">
                        {metricProject.metricBefore} &rarr; {metricProject.metricAfter}
                      </div>
                      <div className="mt-1 font-mono text-[11px] font-bold uppercase tracking-widest text-foreground-bright">
                        {metricProject.metricLabel ?? "Query speedup"}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative flex-1 overflow-hidden">
                <Image
                  src="/hero-portrait-cutout.png"
                  alt="Josue Garcia"
                  fill
                  priority
                  className="object-cover object-[50%_15%]"
                  sizes="320px"
                />
                <div className="absolute right-0 bottom-0 left-0 bg-foreground-bright px-3 py-2">
                  <span className="font-mono text-[10px] tracking-[0.2em] text-background uppercase">
                    Josue Garcia &middot; Data Engineer &middot; 2026
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statement banner */}
      <div className="overflow-hidden border-b border-foreground-bright bg-card py-2.5">
        <div className="font-mono text-[11px] font-bold tracking-[0.2em] whitespace-nowrap text-muted uppercase">
          {"Zero managed cloud databases • 1M+ synthetic rows benchmarked • Tailscale-only admin • self-hosted on a home Ubuntu server • ".repeat(
            4,
          )}
        </div>
      </div>

      {/* Chained projects — alternating image/text, numbered, status-badged */}
      <section className="border-b border-foreground-bright py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mb-12 grid grid-cols-1 gap-0 border-b border-foreground-bright pb-8 lg:grid-cols-12">
            <div className="mb-6 border-foreground-bright pr-0 lg:col-span-3 lg:mb-0 lg:border-r lg:pr-8">
              <span className="kicker mb-3 block">Projects</span>
              <div className="mb-3 h-px w-12 bg-accent" />
              <p className="font-mono text-[11px] leading-relaxed text-muted">
                Each project feeds the next. Chained output, one connected dataset.
              </p>
            </div>
            <div className="flex items-end pl-0 lg:col-span-9 lg:pl-10">
              <h2 className="font-serif text-foreground-bright text-[clamp(2rem,5vw,3.5rem)] leading-[0.92]">
                Three Projects.
                <br />
                <span className="text-accent">One Dataset.</span>
              </h2>
            </div>
          </div>

          <div className="flex flex-col gap-0">
            {allProjects.map((project, i) => (
              <article key={project.slug} className="group grid grid-cols-1 gap-0 border-b border-foreground-bright lg:grid-cols-12">
                <div
                  className={`relative col-span-12 overflow-hidden lg:col-span-5 ${i % 2 === 0 ? "lg:order-1" : "lg:order-2"}`}
                  style={{ minHeight: "320px" }}
                >
                  {project.imageKey ? (
                    <Image
                      src={`/api/files/${project.imageKey}`}
                      alt={`${project.title} screenshot`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 42vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-foreground-bright">
                      <span className="font-serif text-5xl text-background/20">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                  )}
                  {project.metricBefore && project.metricAfter && (
                    <div className="absolute right-0 bottom-0 left-0 flex items-baseline gap-3 bg-foreground-bright px-5 py-3">
                      <span className="font-serif text-2xl text-background">
                        {project.metricBefore} &rarr; {project.metricAfter}
                      </span>
                      <span className="font-mono text-[10px] tracking-widest text-background/60 uppercase">
                        {project.metricLabel}
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className={`col-span-12 flex flex-col justify-between p-8 lg:col-span-7 lg:p-10 ${
                    i % 2 === 0
                      ? "lg:order-2 lg:border-l lg:border-foreground-bright"
                      : "lg:order-1 lg:border-r lg:border-foreground-bright"
                  }`}
                >
                  <div className="mb-6 flex items-start justify-between">
                    <span className="font-serif text-7xl leading-none text-border-soft select-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <StatusBadge status={project.status} />
                  </div>

                  <div className="mb-6">
                    <span className="kicker mb-2 block">{project.track}</span>
                    <Link href={`/projects/${project.slug}`}>
                      <h3 className="font-serif text-3xl leading-tight text-foreground-bright transition-colors group-hover:text-accent sm:text-4xl">
                        {project.title}
                      </h3>
                    </Link>
                  </div>

                  <p className="mb-6 border-l-2 border-accent pl-4 text-sm leading-relaxed text-muted">
                    {project.summary}
                  </p>

                  <div className="mb-8 flex flex-wrap gap-2">
                    {project.skills.slice(0, 6).map((skill) => (
                      <SkillTag key={skill} skill={skill} />
                    ))}
                  </div>

                  <Link
                    href={`/projects/${project.slug}`}
                    className="inline-flex items-center gap-2 self-start border-b border-foreground-bright pb-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-foreground-bright transition-colors hover:border-accent hover:text-accent"
                  >
                    Read Full Case Study &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Skills & tools strip */}
      {skillSections.length > 0 && (
        <section className="border-b border-foreground-bright bg-border-soft/30 py-12">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <div className="mb-8 flex items-center gap-6 border-b border-foreground-bright pb-5">
              <span className="kicker">Skills &amp; Tools</span>
              <div className="h-px flex-1 bg-foreground-bright opacity-10" />
              <span className="folio-label">Technologies used across every project</span>
            </div>
            <div
              className="grid grid-cols-1 border border-foreground-bright sm:grid-cols-2"
              style={{ gridTemplateColumns: `repeat(${Math.min(skillSections.length, 5)}, minmax(0, 1fr))` }}
            >
              {skillSections.map((group, idx) => (
                <div
                  key={group.category}
                  className={`p-6 ${idx < skillSections.length - 1 ? "border-b border-foreground-bright sm:border-r sm:border-b-0" : ""}`}
                >
                  <span className="kicker mb-4 block border-b border-foreground-bright pb-3">{group.category}</span>
                  <div className="flex flex-col gap-2">
                    {group.skills.map((skill) => (
                      <span key={skill} className="font-mono text-[11px] text-muted transition-colors hover:text-accent">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest posts — asymmetric two-column */}
      {latestPosts.length > 0 && (
        <section className="border-b border-foreground-bright py-16">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <div className="mb-10 flex items-end justify-between border-b border-foreground-bright pb-6">
              <div>
                <span className="kicker mb-2 block">Writing</span>
                <h2 className="font-serif text-foreground-bright text-[clamp(2rem,5vw,3.5rem)] leading-[0.92]">
                  Latest Posts
                </h2>
              </div>
              <Link
                href="/blog"
                className="border-b border-foreground-bright pb-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-foreground-bright transition-colors hover:border-accent hover:text-accent"
              >
                All Posts &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-12 gap-0">
              {latestPosts.map((post, idx) => (
                <article
                  key={post.id}
                  className={`col-span-12 group pb-10 lg:pb-0 ${
                    idx === 0 ? "border-foreground-bright lg:col-span-7 lg:border-r lg:pr-10" : "lg:col-span-5 lg:pl-10"
                  } ${idx > 0 ? "border-t border-foreground-bright pt-10 lg:border-t-0 lg:pt-0" : ""}`}
                >
                  {post.coverImageUrl && (
                    <div
                      className="relative mb-6 overflow-hidden"
                      style={{ aspectRatio: idx === 0 ? "16/9" : "4/3" }}
                    >
                      <Image
                        src={post.coverImageUrl}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 58vw"
                      />
                    </div>
                  )}

                  <h3
                    className={`font-serif leading-tight text-foreground-bright mb-4 ${idx === 0 ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"}`}
                  >
                    <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-accent">
                      {post.title}
                    </Link>
                  </h3>

                  {post.excerpt && <p className="mb-6 text-sm leading-relaxed text-muted">{post.excerpt}</p>}

                  <div className="flex items-center justify-between border-t border-foreground-bright pt-4">
                    <span className="folio-label">
                      {post.publishedAt?.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="border-b border-foreground-bright pb-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-foreground-bright transition-colors hover:border-accent hover:text-accent"
                    >
                      Read &rarr;
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact — dark inverted, editorial link list */}
      <section className="bg-foreground-bright">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="flex items-center justify-between border-b border-background/20 py-4">
            <span className="font-mono text-[11px] tracking-[0.14em] text-background/40 uppercase">Contact</span>
            <span className="font-mono text-[11px] tracking-[0.14em] text-background/40 uppercase">Open to Work &middot; 2026</span>
          </div>

          <div className="grid grid-cols-1 gap-0 py-16 lg:grid-cols-12">
            <div className="mb-12 border-background/20 pr-0 lg:col-span-5 lg:mb-0 lg:border-r lg:pr-12">
              <h2 className="font-serif text-background text-[clamp(2rem,5vw,3.5rem)] leading-none mb-8">
                Let&rsquo;s Talk
                <br />
                <span className="text-accent">Data.</span>
              </h2>
              <p className="mb-10 border-l-2 border-accent pl-4 text-sm leading-relaxed text-background/60">
                Open to data analyst, database engineer, and data engineering roles.
                I prefer async-first communication &mdash; GitHub issues, email, or LinkedIn DMs.
              </p>
              <a
                href="mailto:josuegarciaii@yahoo.com"
                className="inline-flex items-center gap-3 bg-accent px-8 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80"
              >
                Send Email &rarr;
              </a>
            </div>

            <div className="flex flex-col justify-center pl-0 lg:col-span-7 lg:pl-12">
              <span className="kicker mb-6 block text-background/40">Find me at</span>
              <div className="flex flex-col gap-0">
                {[
                  { label: "GitHub", value: "github.com/bitz161", href: "https://github.com/bitz161" },
                  {
                    label: "Portfolio Source",
                    value: "github.com/bitz161/portfolio-site",
                    href: "https://github.com/bitz161/portfolio-site",
                  },
                  {
                    label: "LinkedIn",
                    value: "linkedin.com/in/josue-garcia-47597b180",
                    href: "https://www.linkedin.com/in/josue-garcia-47597b180",
                  },
                  { label: "Live Site", value: "swe-2.tail174d56.ts.net", href: "https://swe-2.tail174d56.ts.net" },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between border-b border-background/10 py-5 transition-colors hover:border-background/30"
                  >
                    <div>
                      <span className="block font-mono text-[11px] font-bold tracking-[0.14em] text-background uppercase transition-colors group-hover:text-accent">
                        {link.label}
                      </span>
                      <span className="font-mono text-[10px] text-background/40 transition-opacity group-hover:opacity-60">
                        {link.value}
                      </span>
                    </div>
                    <span className="font-mono text-sm text-background/20 transition-all group-hover:text-accent group-hover:opacity-60">
                      &#8599;
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
