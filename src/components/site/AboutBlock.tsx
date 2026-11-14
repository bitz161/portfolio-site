import Image from "next/image";
import { Reveal } from "@/components/motion/primitives";

const FACTS = [
  ["Does", "Database administration: MySQL, Postgres, replication, failover"],
  ["Learning", "Data engineering: Airflow, Kafka, dbt"],
  ["Runs on", "One server at home, three MySQL nodes"],
  ["Open to", "Database administration and data engineering roles"],
];

/** Portrait and side facts at the left, the wide paragraph from the 34% line. */
export default function AboutBlock({ priority = false }: { priority?: boolean }) {
  return (
    <div className="about">
      <Reveal>
        <div className="portrait">
          <Image src="/hero-portrait-cutout.png" alt="Portrait of Josue Garcia" fill priority={priority} sizes="300px" className="object-cover object-top" />
        </div>
      </Reveal>
      <Reveal i={1}>
        <p className="t-lead max-w-[46ch]">
          I keep databases fast, replicated and recoverable. I learn by running the real thing: this site, its database and
          the pipelines behind it all live on a server in my home, wired together with the same tools teams use in
          production. When something breaks, and I break it on purpose, I write down what happened, what it cost and how I
          fixed it.
        </p>
        <dl className="mt-10 grid max-w-[46rem] gap-x-[var(--m)] gap-y-5 sm:grid-cols-2">
          {FACTS.map(([k, v]) => (
            <div key={k}>
              <dt className="soft">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </div>
  );
}
