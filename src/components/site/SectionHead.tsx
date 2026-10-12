import { Reveal } from "@/components/motion/primitives";

export default function SectionHead({ index, label, title, desc }: { index: string; label: string; title: React.ReactNode; desc?: string }) {
  return (
    <header className="mb-10">
      <Reveal>
        <p className="label">
          {index} · {label}
        </p>
      </Reveal>
      <Reveal i={1}>
        <h2 className="h-display mt-3 text-[clamp(2.4rem,5.5vw,4rem)]">{title}</h2>
      </Reveal>
      {desc && (
        <Reveal i={2}>
          <p className="mt-4 max-w-xl text-muted">{desc}</p>
        </Reveal>
      )}
    </header>
  );
}
