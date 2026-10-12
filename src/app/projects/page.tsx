import type { Metadata } from "next";
import { getProjects } from "@/lib/projects";
import { toGrid } from "@/lib/derived";
import ProjectGrid from "@/components/projects/ProjectGrid";
import SectionHead from "@/components/site/SectionHead";
import { Reveal } from "@/components/motion/primitives";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Work" };

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <section className="shell pt-36 pb-16">
      <SectionHead
        index="Work"
        label={`${projects.length} projects`}
        title={<>Every project, <em className="text-ember-soft">documented.</em></>}
        desc="Database administration first, data engineering next. Done, in progress and planned, so you can see where it's heading."
      />
      <Reveal i={2}>
        <ProjectGrid projects={projects.map(toGrid)} />
      </Reveal>
    </section>
  );
}
