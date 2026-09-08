import Image from "next/image";
import Link from "next/link";
import { getProjects } from "@/lib/projects";
import { StatusBadge } from "@/components/Badge";

export const dynamic = "force-dynamic";

export default async function Home() {
  const allProjects = await getProjects();
  const projects = allProjects.slice(0, 4);
  const projectCount = allProjects.length;

  return (
    <div>
      {/* Hero: brown ground, text left / photo bleeding to the right edge -- this section only */}
      <section className="relative overflow-hidden bg-[#141109]">
        <div className="grid grid-cols-1 items-center sm:grid-cols-2">
          <div className="order-2 flex min-w-0 flex-col justify-center px-6 py-14 sm:order-1 sm:px-16 sm:py-0">
            <p className="font-mono text-2xl text-background/70 sm:text-3xl">
              Hey, I&rsquo;m
            </p>
            <h1 className="mt-1 font-serif text-6xl leading-[0.95] font-black tracking-tight text-background sm:text-8xl">
              Josue
            </h1>

            <p className="mt-5 font-mono text-xs font-bold tracking-[0.2em] text-accent uppercase">
              Data &amp; Database Engineer
            </p>

            <p className="mt-8 font-mono text-xs tracking-widest text-background/50 uppercase">
              {String(projectCount).padStart(2, "0")} projects on this site &middot; est. 2026
            </p>
          </div>

          <div className="relative order-1 aspect-[6/5] min-w-0 sm:order-2">
            <Image
              src="/hero-portrait-cutout.png"
              alt="Portrait"
              fill
              priority
              className="object-cover object-top"
            />
          </div>
        </div>
      </section>

      {/* Statement */}
      <section className="mx-auto max-w-5xl px-6 py-24 sm:py-28">
        <span className="kicker">Sound familiar?</span>
        <h2 className="mt-5 max-w-3xl font-serif text-3xl leading-[1.15] font-bold text-foreground-bright sm:text-5xl">
          You need real infrastructure work shown, not another to-do app.
          I design and run <em className="text-accent not-italic">production-shaped</em>{" "}
          database systems, end to end.
        </h2>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link href="/projects" className="btn-pill">
            View projects
            <span className="btn-pill-icon" aria-hidden>
              &rarr;
            </span>
          </Link>
          <Link href="/about" className="btn-pill-ghost">
            About me
            <span className="btn-pill-icon" aria-hidden>
              &rarr;
            </span>
          </Link>
        </div>
      </section>

      <div className="overflow-hidden border-y border-border bg-card py-2.5">
        <div className="font-mono text-[11px] font-bold tracking-[0.2em] whitespace-nowrap text-muted uppercase">
          {"Zero managed cloud databases • 1M+ synthetic rows benchmarked • Tailscale-only admin • self-hosted on a home Ubuntu server • ".repeat(4)}
        </div>
      </div>

      {/* Featured projects, terminal-window cards */}
      <section className="mx-auto max-w-5xl px-6 py-24 sm:py-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <span className="kicker">Selected work</span>
            <h2 className="mt-4 font-serif text-3xl font-bold text-foreground-bright sm:text-4xl">
              Featured work
            </h2>
          </div>
          <span className="section-count font-serif text-2xl sm:text-3xl">
            {String(projects.length).padStart(2, "0")}
          </span>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {projects.map((project, i) => (
            <Link key={project.slug} href={`/projects/${project.slug}`} className="group block">
              <div className="overflow-hidden rounded-2xl bg-[#141109] shadow-[0_1px_2px_rgba(20,17,10,0.04),0_16px_36px_-16px_rgba(20,17,10,0.35)] transition-transform group-hover:-translate-y-1">
                <div className="flex items-center gap-1.5 border-b border-background/10 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-accent-danger/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-accent-warm/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-accent-teal/70" />
                  <span className="ml-3 font-mono text-[10px] tracking-widest text-background/40 uppercase">
                    {project.track}
                  </span>
                </div>
                <div className="px-5 py-8 sm:px-6 sm:py-10">
                  <p className="font-serif text-sm text-accent italic">
                    0{i + 1}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl font-bold text-background">
                    {project.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-background/60">
                    {project.summary}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between px-1">
                <StatusBadge status={project.status} />
                <span className="font-mono text-xs text-muted transition-colors group-hover:text-accent">
                  View &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Closing CTA, dark inverted */}
      <section className="bg-[#141109]">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <span className="kicker text-background/70">Get in touch</span>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-background/10 sm:h-20 sm:w-20">
              <Image
                src="/hero-portrait.png"
                alt=""
                fill
                className="object-cover object-[50%_15%]"
              />
            </div>
            <h2 className="font-serif text-4xl leading-none font-black text-background sm:text-6xl">
              Ready to see
              <br />
              the code&nbsp;
              <span className="text-accent">&mdash;</span>
            </h2>
          </div>

          <div className="mt-10 border-t border-background/15 pt-8">
            <Link
              href="/projects"
              className="inline-flex items-center gap-3 rounded-full bg-background px-6 py-3.5 font-mono text-xs font-bold tracking-widest text-foreground-bright uppercase transition-opacity hover:opacity-85"
            >
              Browse the portfolio
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-foreground-bright/30">
                &rarr;
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
