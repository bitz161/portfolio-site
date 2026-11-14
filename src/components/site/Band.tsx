import Image from "next/image";
import Link from "next/link";

/** Full-width bands: a photograph, then real commands, output and timings taken from the write-ups. */
const BANDS = {
  plan: {
    href: "/projects/dba-performance",
    photo: { src: "/assets/server-cables.jpg", alt: "Server racks behind mesh doors, patch cables and status lights", position: "50% 50%" },
    code: (
      <>
        <b>EXPLAIN ANALYZE</b>{"\n"}
        SELECT id, title, date_posted FROM jobs{"\n"}
        WHERE seniority = &apos;Senior&apos;{"\n"}
        {"  "}AND date_posted BETWEEN &apos;2024-01-01&apos; AND &apos;2024-06-30&apos;{"\n"}
        ORDER BY date_posted DESC LIMIT 50;{"\n\n"}
        <b>CREATE INDEX idx_seniority_date_posted</b>{"\n"}
        <b>{"  "}ON jobs (seniority, date_posted);</b>
      </>
    ),
    head: "One index, 17 times faster",
    body: (
      <div className="bars">
        <p><i />26.8 ms. MySQL walked 335,892 rows in the date range, checking seniority on each.</p>
        <p><i style={{ width: "6%" }} />1.6 ms. One range scan over matching rows only, already in date order.</p>
      </div>
    ),
    more: "A million rows, tuned and measured",
  },
  incident: {
    href: "/projects/high-availability-replication-automated-failover",
    photo: { src: "/assets/fiber-switch.jpg", alt: "Labelled fibre cables plugged into a network switch", position: "50% 55%" },
    code: (
      <>
        <b>SHOW REPLICA STATUS\G</b>{"\n"}
        Replica_SQL_Running: <b>No</b>{"\n"}
        Last_SQL_Error: <b>Errno 1049 &quot;Unknown database&quot;</b>{"\n\n"}
        <b>SHOW DATABASES;</b>{"\n"}
        analytics, bookstack_db, budget_db, metabase_app,{"\n"}
        movielens, portfolio, project1_jobs, project3_perf,{"\n"}
        sandbox_db, todo_db
      </>
    ),
    head: "The replica stopped on a database it never had",
    body: (
      <p className="mt-6 max-w-[46ch]">
        The primary&apos;s binlog carries every database on the server, and real app traffic hit one the replica was
        missing. The fix was to replicate the whole server, which is what a failover needs anyway.
      </p>
    ),
    more: "How the replication was built and broken",
  },
};

export default function Band({ show, className }: { show: keyof typeof BANDS; className?: string }) {
  const b = BANDS[show];
  return (
    <section className={className}>
      <div className="band-photo">
        <Image src={b.photo.src} alt={b.photo.alt} fill sizes="100vw" style={{ objectPosition: b.photo.position }} />
      </div>
      <div className="band shell">
        <pre><code>{b.code}</code></pre>
        <div>
          <h2 className="t-head">{b.head}</h2>
          {b.body}
          <Link href={b.href} prefetch className="link mt-6 inline-block font-medium">{b.more}</Link>
        </div>
      </div>
    </section>
  );
}
