import ActionLink from "@/components/site/ActionLink";

export default function NotFound() {
  return (
    <section className="shell flex min-h-[80dvh] flex-col justify-center pt-28">
      <p className="label">404</p>
      <h1 className="h-display mt-4 text-[clamp(3.4rem,10vw,8rem)]">
        <span className="mask"><span>Empty</span></span> <span className="mask"><span style={{ "--i": 1 } as React.CSSProperties}><em className="text-ember-soft">set.</em></span></span>
      </h1>
      <div className="surface fade-in mt-10 max-w-xl p-6 font-mono text-sm" style={{ "--d": "500ms" } as React.CSSProperties}>
        <p><span className="text-ember-soft">mysql&gt;</span> SELECT * FROM pages WHERE path = &apos;this one&apos;;</p>
        <p className="mt-2 text-muted">Empty set (0.00 sec)</p>
      </div>
      <div className="fade-in mt-10 flex gap-3" style={{ "--d": "700ms" } as React.CSSProperties}>
        <ActionLink href="/" icon="right">Home</ActionLink>
        <ActionLink href="/projects" variant="ghost">Work</ActionLink>
      </div>
    </section>
  );
}
