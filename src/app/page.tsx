import { getProjects } from "@/lib/projects";
import { getPublishedPosts } from "@/lib/blog";
import { getSkillCategoryMap, getSkillGroups } from "@/lib/skill-categories";
import { SITE, speedup } from "@/lib/site";
import { skillGroups, toGrid } from "@/lib/derived";
import { CountUp, Magnetic, Reveal } from "@/components/motion/primitives";
import ProjectGrid from "@/components/projects/ProjectGrid";
import SectionHead from "@/components/site/SectionHead";
import CopyEmail from "@/components/site/CopyEmail";
import ActionLink from "@/components/site/ActionLink";
import PostCard from "@/components/blog/PostCard";

export const dynamic = "force-dynamic";

// The accent phrase is one masked unit so the gradient sweeps across it once.
const WORDS: [string, boolean][] = [["Systems", false], ["that", false], ["don't break.", true]];

export default async function Home() {
  const [projects, posts, categoryMap, groupNames] = await Promise.all([getProjects(), getPublishedPosts(), getSkillCategoryMap(), getSkillGroups()]);
  const done = projects.filter((p) => p.status === "done").length;
  const metric = projects.find((p) => p.metricBefore && p.metricAfter);
  const factor = metric ? speedup(metric.metricBefore!, metric.metricAfter!) : null;
  const groups = skillGroups(projects, categoryMap, groupNames);
  const skillCount = groups.reduce((n, g) => n + g.skills.length, 0);

  const stats = [
    { value: <CountUp to={projects.length} />, label: "projects documented" },
    { value: <CountUp to={done} />, label: "shipped and running" },
    ...(factor ? [{ value: <CountUp to={factor} decimals={1} suffix="×" />, label: `faster query after one index (${metric!.metricBefore} → ${metric!.metricAfter})` }] : []),
    { value: <CountUp to={skillCount} />, label: "tools used in the work" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="shell flex min-h-dvh flex-col justify-center pt-24 pb-16">
        <p className="kicker fade-in" style={{ "--d": "100ms" } as React.CSSProperties}>
          {SITE.name} · {SITE.role}
        </p>
        <h1 className="h-display my-6 text-[clamp(3.4rem,11vw,9rem)]">
          {WORDS.map(([w, accent], i) => (
            <span key={w}>
              <span className="mask">
                <span style={{ "--i": i } as React.CSSProperties} className={accent ? "grad italic" : undefined}>
                  {w}
                </span>
              </span>
              {i === 1 ? <br /> : " "}
            </span>
          ))}
        </h1>
        <p className="fade-in max-w-xl text-lg leading-relaxed text-muted" style={{ "--d": "900ms" } as React.CSSProperties}>
          I design, run and tune databases and the pipelines around them: replication with automatic failover,
          change data capture into Postgres, Airflow jobs, and the monitoring that catches it when something slips.
          All of it runs on my own server.
        </p>
        <div className="fade-in mt-10 flex flex-wrap items-center gap-4" style={{ "--d": "1050ms" } as React.CSSProperties}>
          <Magnetic>
            <ActionLink href="#work" icon="down">See the work</ActionLink>
          </Magnetic>
          <ActionLink href={SITE.github} icon="out" variant="ghost">GitHub</ActionLink>
        </div>
      </section>

      {/* Numbers */}
      <section className="shell py-20">
        <SectionHead index="01" label="By the numbers" title="Real numbers, from the live database." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} i={i} className="surface p-7">
              <p className="font-display text-6xl leading-none">{s.value}</p>
              <p className="mt-3 text-sm text-muted">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Work */}
      <section id="work" className="shell scroll-mt-24 py-20">
        <SectionHead
          index="02"
          label="Work"
          title="Built, broken on purpose, fixed."
          desc="Each project is a write-up of something I actually ran: what I built, what failed, and the numbers before and after."
        />
        <Reveal i={2}>
          <ProjectGrid projects={projects.map(toGrid)} />
        </Reveal>
      </section>

      {/* Stack */}
      {groups.length > 0 && (
        <section className="shell py-20">
          <SectionHead index="03" label="Stack" title="Tools I reach for." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g, i) => (
              <Reveal key={g.category} i={i} className="surface p-6">
                <p className="label">{g.category}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {g.skills.map((s) => (
                    <li key={s} className="chip text-ink">{s}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Writing */}
      {posts.length > 0 && (
        <section className="shell py-20">
          <SectionHead index="04" label="Writing" title="Notes from the work." />
          <div className={`grid gap-4 ${posts.length > 1 ? "md:grid-cols-2" : ""}`}>
            {posts.slice(0, 2).map((post, i) => (
              <Reveal key={post.slug} i={i}>
                <PostCard post={post} wide={posts.length === 1} />
              </Reveal>
            ))}
          </div>
          <Reveal i={2} className="mt-8">
            <ActionLink href="/blog" variant="ghost">All writing</ActionLink>
          </Reveal>
        </section>
      )}

      {/* Contact */}
      <section className="shell py-24">
        <Reveal>
          <p className="label">05 · Contact</p>
        </Reveal>
        <Reveal i={1}>
          <h2 className="h-display mt-3 text-[clamp(3rem,9vw,7rem)]">
            Let&apos;s talk <em className="text-ember-soft">data.</em>
          </h2>
        </Reveal>
        <Reveal i={2} className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <CopyEmail email={SITE.email} />
          <div className="flex gap-3">
            <ActionLink href={SITE.linkedin} icon="out" variant="ghost">LinkedIn</ActionLink>
            <ActionLink href={SITE.github} icon="out" variant="ghost">GitHub</ActionLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
