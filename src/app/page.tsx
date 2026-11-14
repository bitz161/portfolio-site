import { getProjects } from "@/lib/projects";
import { getPublishedPosts } from "@/lib/blog";
import { getSkillCategoryMap, getSkillGroups } from "@/lib/skill-categories";
import { skillGroups, toGrid, topSkills } from "@/lib/derived";
import { Letters, Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import ProjectGrid from "@/components/projects/ProjectGrid";
import FailoverDrill from "@/components/home/FailoverDrill";
import ContactRows from "@/components/site/ContactRows";
import ActionLink from "@/components/site/ActionLink";
import PostCard from "@/components/blog/PostCard";
import AboutBlock from "@/components/site/AboutBlock";
import Band from "@/components/site/Band";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [projects, posts, categoryMap, groupNames] = await Promise.all([getProjects(), getPublishedPosts(), getSkillCategoryMap(), getSkillGroups()]);
  const groups = skillGroups(projects, categoryMap, groupNames);
  const top = topSkills(projects, 6);
  const done = projects.filter((p) => p.status === "done").length;

  return (
    <>
      {/* Hero: the name, cropped by the screen */}
      <section className="hero">
        <div className="shell">
          <div className="hero-copy">
            <p className="t-lead fade-in" style={{ "--d": "500ms" } as React.CSSProperties}>
              I&apos;m Josue Garcia, a database administrator. I keep MySQL taking writes when its primary dies, and I&apos;m growing
              that into data engineering.
            </p>
            <div className="fade-in mt-7 flex flex-wrap gap-3" style={{ "--d": "650ms" } as React.CSSProperties}>
              <ActionLink href="#work" icon="down">See the work</ActionLink>
              <ActionLink href="/Josue_Garcia_CV_DBA.pdf" icon="down" variant="ghost">Download CV</ActionLink>
            </div>
          </div>
        </div>
        {/* the label is the page's title; the cropped word is its picture */}
        <h1 className="hero-word" aria-label="Josue Garcia, database administrator and data engineer">
          <Letters text="Josue" step={0.09} onLoad />
        </h1>
      </section>

      {/* One figure owns the screen, and the drill that produced it */}
      <section className="field">
        <div className="shell stat">
          <div className="stat-left">
            <h2 className="t-head max-w-[14ch]"><Letters text="Primary killed. Writes back in" /></h2>
            <div className="mt-16">
              <Reveal>
                <p className="stat-figure">6.9<sup>s</sup></p>
              </Reveal>
              <Reveal i={1}>
                <p className="mt-8 max-w-[36ch]">
                  From <code>docker kill</code> on the primary to the first accepted write, under load on my live three-server
                  stack. By hand, the same drill took 491.7 s. Zero failed writes, zero acknowledged writes lost.
                </p>
              </Reveal>
            </div>
          </div>
          <Reveal i={2} className="stat-right">
            <FailoverDrill />
            <p className="t-small soft mt-3">A replay of the measured drill. The times and counts are the real ones.</p>
          </Reveal>
        </div>
      </section>

      <Band show="plan" />

      {/* Work */}
      <section id="work" className="shell sec scroll-mt-8 pt-[var(--gap)]">
        <ProjectGrid
          projects={projects.map(toGrid)}
          side={
            <>
              <h2 className="t-head"><Letters text="Built, broken, fixed" /></h2>
              <Reveal i={1}>
                <p className="mt-5 max-w-[30ch]">
                  {projects.length} write-ups, {done} of them finished: what I built, what failed, and the numbers before and after.
                </p>
              </Reveal>
            </>
          }
        />
      </section>

      {/* Tools as a poster */}
      {top.length > 0 && (
        <section className="shell sec">
          <h2 className="t-head"><Letters text="Tools I reach for" /></h2>
          <Stagger className="poster t-poster mt-10" gap={0.07}>
            {top.map(([skill, n]) => (
              <StaggerItem key={skill} from="left">
                {skill}
                <span className="fact">{n === 1 ? "one project" : `${n} projects`}</span>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="mt-16">
            <dl className="pairs">
              {groups.map((g) => (
                <div key={g.category} className="contents">
                  <dt className="font-medium">{g.category}</dt>
                  <dd className="max-w-[80ch]">{g.skills.join(", ")}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </section>
      )}

      <Band show="incident" className="pt-[calc(var(--gap)/2)]" />

      {/* Writing */}
      {posts.length > 0 && (
        <section className="shell sec pt-[var(--gap)]">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <h2 className="t-head"><Letters text="I write it all down" /></h2>
            <ActionLink href="/blog" variant="ghost">All writing</ActionLink>
          </div>
          <Reveal>
            <PostCard post={posts[0]} />
          </Reveal>
        </section>
      )}

      {/* About */}
      <section className="shell sec">
        <h2 className="t-head mb-10"><Letters text="Who runs this" /></h2>
        <AboutBlock />
        <Reveal className="mt-10">
          <ActionLink href="/about" variant="ghost">More about me</ActionLink>
        </Reveal>
      </section>

      {/* Contact */}
      <section className="sec pb-0">
        <h2 className="shell t-head mb-10"><Letters text="Get in touch" /></h2>
        <ContactRows />
      </section>
    </>
  );
}
