import type { Metadata } from "next";
import Image from "next/image";
import { SITE } from "@/lib/site";
import { Reveal } from "@/components/motion/primitives";
import CopyEmail from "@/components/site/CopyEmail";

export const metadata: Metadata = { title: "About" };

const PATH = [
  { when: "Now", title: "Database administration", body: "MySQL replication with automatic failover, ProxySQL routing, CDC into Postgres, monitoring and alerting. Run on my own server, documented as I go." },
  { when: "Next", title: "Python and Airflow", body: "Scheduled pipelines that land raw data, transform it and check its quality before anyone queries it." },
  { when: "Then", title: "Kafka and dbt", body: "Streaming changes instead of nightly batches, and transformations as tested, versioned SQL." },
  { when: "Later", title: "Snowflake and Databricks", body: "The same ideas on managed cloud platforms, with a certification to show for it." },
];

const STACK = ["MySQL 8.4", "PostgreSQL", "ProxySQL", "Orchestrator", "Debezium", "Kafka", "Airflow", "MinIO", "Grafana", "Prometheus", "Docker", "Tailscale"];

export default function AboutPage() {
  return (
    <div className="shell pt-36 pb-16">
      <section className="grid items-end gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <p className="kicker fade-in">About</p>
          <h1 className="h-display mt-4 text-[clamp(3rem,8vw,6rem)]">
            <span className="mask"><span>Josue</span></span> <span className="mask"><span style={{ "--i": 1 } as React.CSSProperties}><em className="text-ember-soft">Garcia.</em></span></span>
          </h1>
          <p className="fade-in mt-8 max-w-xl text-lg leading-relaxed text-muted" style={{ "--d": "600ms" } as React.CSSProperties}>
            I keep databases fast, replicated and recoverable, and I&apos;m growing that into data engineering. I learn by running
            the real thing: this site, its database and the pipelines behind it all live on a server in my home, wired together
            with the same tools teams use in production.
          </p>
        </div>
        <Reveal i={1} className="relative mx-auto aspect-[4/5] w-full max-w-[380px] overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-steel/25 to-ember/15">
          <Image src="/hero-portrait-cutout.png" alt="Portrait of Josue Garcia" fill priority sizes="380px" className="object-cover object-top" />
        </Reveal>
      </section>

      <section className="mt-28">
        <Reveal><p className="label">The path</p></Reveal>
        <ol className="relative mt-8 space-y-4 border-l border-line pl-8">
          {PATH.map((step, i) => (
            <li key={step.title}>
              <Reveal i={i} className="surface relative p-6">
                <span aria-hidden className={`absolute top-8 -left-[37px] h-3 w-3 rounded-full ring-4 ring-bg ${i === 0 ? "bg-ember" : "bg-white/20"}`} />
                <p className="kicker">{step.when}</p>
                <h2 className="mt-2 font-display text-3xl">{step.title}</h2>
                <p className="mt-2 max-w-2xl text-muted">{step.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-28 grid gap-4 lg:grid-cols-2">
        <Reveal className="surface p-8">
          <p className="label">Home lab stack</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {STACK.map((t) => <li key={t} className="chip text-ink">{t}</li>)}
          </ul>
        </Reveal>
        <Reveal i={1} className="surface flex flex-col justify-between gap-8 p-8">
          <div>
            <p className="label">Get in touch</p>
            <p className="mt-3 text-muted">Open to database administration and data engineering roles.</p>
          </div>
          <CopyEmail email={SITE.email} />
          <div className="flex flex-wrap gap-3">
            <a className="btn-ghost" href={SITE.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
            <a className="btn-ghost" href={SITE.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
