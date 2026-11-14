"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { ProjectStatus } from "@/lib/projects";
import { STATUS_LABEL } from "@/lib/site";
import { Stagger, StaggerItem } from "@/components/motion/primitives";

export type GridProject = {
  slug: string;
  title: string;
  summary: string;
  status: ProjectStatus;
  skills: string[];
  updated: string;
};

const ORDER: ProjectStatus[] = ["done", "in-progress", "not-started"];

/**
 * The work as a plain ledger grouped by status. On wide screens the row in hand shows its
 * summary in the panel at the right; `side` (the section's heading) sits in the left column.
 */
/** `headingLevel` is the level of the status group headings: h3 under a section h2, h2 when the page h1 is directly above. */
export default function ProjectGrid({ projects, side, headingLevel: Heading = "h3" }: { projects: GridProject[]; side: ReactNode; headingLevel?: "h2" | "h3" }) {
  const [slug, setSlug] = useState(projects[0]?.slug);
  const shown = projects.find((p) => p.slug === slug) ?? projects[0];

  return (
    <div className="ledger-wrap">
      <div className="ledger-side">{side}</div>

      <div className="ledger">
        {ORDER.map((status) => {
          const group = projects.filter((p) => p.status === status);
          if (group.length === 0) return null;
          return (
            <section key={status} className="ledger-group">
              <Heading className="soft pb-1">
                {STATUS_LABEL[status]}, {group.length}
              </Heading>
              <Stagger gap={0.04}>
                {group.map((p) => (
                  <StaggerItem key={p.slug}>
                    <Link href={`/projects/${p.slug}`} prefetch className="ledger-row" onMouseEnter={() => setSlug(p.slug)} onFocus={() => setSlug(p.slug)}>
                      <span className="font-medium">{p.title}</span>
                      <span className="when lg:order-last">{p.updated}</span>
                      <span className="kind">{p.skills.slice(0, 2).join(", ") || "Write-up of the plan"}</span>
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            </section>
          );
        })}
      </div>

      {shown && (
        <aside className="ledger-preview" aria-hidden>
          <div key={shown.slug}>
            <p className="t-lead font-medium">{shown.title}</p>
            <p className="mt-4">{shown.summary}</p>
            {shown.skills.length > 0 && <p className="soft mt-4">{shown.skills.join(", ")}</p>}
          </div>
        </aside>
      )}
    </div>
  );
}
