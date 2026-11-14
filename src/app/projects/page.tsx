import type { Metadata } from "next";
import { getProjects } from "@/lib/projects";
import { toGrid } from "@/lib/derived";
import ProjectGrid from "@/components/projects/ProjectGrid";
import { Letters } from "@/components/motion/primitives";
import Band from "@/components/site/Band";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Work" };

export default async function ProjectsPage() {
  const projects = await getProjects();
  const done = projects.filter((p) => p.status === "done").length;
  const ahead = projects.length - done;
  return (
    <>
    <section className="shell pt-32 pb-[calc(var(--gap)/2)]">
      <h1 className="t-poster mb-14"><Letters text={`${done} shipped, ${ahead} on the plan`} onLoad /></h1>
      <ProjectGrid
        projects={projects.map(toGrid)}
        side={
          <p className="max-w-[30ch]">
            {projects.length} projects. Database administration first, data engineering next. Done, in progress and planned, so you can see where it&apos;s heading.
          </p>
        }
      />
    </section>
    <Band show="plan" className="pb-[calc(var(--gap)/2)]" />
    </>
  );
}
