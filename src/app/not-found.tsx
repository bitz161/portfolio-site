import ActionLink from "@/components/site/ActionLink";
import { Letters } from "@/components/motion/primitives";

export default function NotFound() {
  return (
    <section className="shell flex min-h-[80dvh] flex-col justify-center pt-28">
      <h1 className="stat-figure"><Letters text="Empty set" step={0.06} onLoad /></h1>
      <pre className="fade-in mt-12 max-w-xl overflow-x-auto bg-well p-6 text-sm" style={{ "--d": "500ms" } as React.CSSProperties}>
        <code>{"mysql> SELECT * FROM pages WHERE path = 'this one';\nEmpty set (0.00 sec)"}</code>
      </pre>
      <div className="fade-in mt-8 flex gap-3" style={{ "--d": "700ms" } as React.CSSProperties}>
        <ActionLink href="/">Home</ActionLink>
        <ActionLink href="/projects" variant="ghost">Work</ActionLink>
      </div>
    </section>
  );
}
