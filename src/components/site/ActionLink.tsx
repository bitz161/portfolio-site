import Link from "next/link";
import type { ReactNode } from "react";

export type ActionIcon = "down" | "right" | "out" | "mail" | "check";

const PATHS: Record<ActionIcon, string> = {
  down: "M12 5v14M6 13l6 6 6-6",
  right: "M5 12h14M13 6l6 6-6 6",
  out: "M7 17L17 7M8 7h9v9",
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
  check: "M5 12.5l4.5 4.5L19 7",
};

/** Direction the arrow leaves on hover (a fresh copy comes in from the opposite side). */
const EXIT: Partial<Record<ActionIcon, [string, string]>> = {
  down: ["0", "200%"],
  right: ["200%", "0"],
  out: ["200%", "-200%"],
  mail: ["0", "-200%"],
};

export function Glyph({ icon, className }: { icon: ActionIcon; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={PATHS[icon]} />
    </svg>
  );
}

/** The chip's two stacked glyphs; CSS swaps them on hover. */
export function ActionChip({ icon }: { icon: ActionIcon }) {
  const [x, y] = EXIT[icon] ?? ["0", "0"];
  return (
    <span className="act-chip" style={{ "--ex": x, "--ey": y } as React.CSSProperties}>
      <Glyph icon={icon} className="act-i1" />
      <Glyph icon={icon} className="act-i2" />
    </span>
  );
}

type Props = {
  href: string;
  children: ReactNode;
  icon?: ActionIcon;
  variant?: "solid" | "ghost";
  size?: "md" | "sm";
  className?: string;
};

/** Primary call-to-action: light pill with sheen, ember glow and a swapping icon chip. */
export default function ActionLink({ href, children, icon = "right", variant = "solid", size = "md", className = "" }: Props) {
  const cls = `act ${variant === "ghost" ? "act-ghost" : ""} ${size === "sm" ? "act-sm" : ""} ${className}`;
  const inner = (
    <>
      <span className="act-label">{children}</span>
      <ActionChip icon={icon} />
    </>
  );
  const external = /^(https?:|mailto:)/.test(href);
  return external ? (
    <a href={href} className={cls} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
