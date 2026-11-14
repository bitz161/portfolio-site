import type { Metadata } from "next";
import { Letters, Stagger, StaggerItem } from "@/components/motion/primitives";
import AboutBlock from "@/components/site/AboutBlock";
import ContactRows from "@/components/site/ContactRows";
import Band from "@/components/site/Band";

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
    <>
      <div className="shell pt-32">
        <h1 className="t-poster mb-12"><Letters text="About Josue Garcia" onLoad /></h1>
        <AboutBlock priority />

        <section className="sec pb-0">
          <h2 className="t-head mb-8"><Letters text="The path" /></h2>
          <Stagger as="ol" className="steps">
            {PATH.map((step, i) => (
              <StaggerItem key={step.title} className={i % 2 === 0 ? "field px-4" : "px-4"}>
                <span className={i === 0 ? "font-medium" : "soft"}>{step.when}</span>
                <h3 className="t-lead font-medium">{step.title}</h3>
                <p className="max-w-[60ch]">{step.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section className="sec pairs wide-key">
          <h2 className="t-head"><Letters text="Home lab stack" /></h2>
          <p className="t-lead max-w-[40ch]">{STACK.join(", ")}.</p>
        </section>
      </div>

      <Band show="incident" className="pb-[calc(var(--gap)/2)]" />

      <section>
        <h2 className="shell t-head mb-10"><Letters text="Get in touch" /></h2>
        <ContactRows />
      </section>
    </>
  );
}
