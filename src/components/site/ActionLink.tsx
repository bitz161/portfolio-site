import Link from "next/link";
import type { ReactNode } from "react";

export type ActionIcon = "down" | "right" | "out" | "mail";

const PATHS: Record<ActionIcon, string> = {
  down: "M12 5v14M6 13l6 6 6-6",
  right: "M5 12h14M13 6l6 6-6 6",
  out: "M7 17L17 7M8 7h9v9",
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
};

/** Which way the glyph nudges on hover. */
const NUDGE: Record<ActionIcon, [string, string]> = { down: ["0", "4px"], right: ["4px", "0"], out: ["3px", "-3px"], mail: ["0", "0"] };

export function Glyph({ icon }: { icon: ActionIcon }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="square">
      <path d={PATHS[icon]} />
    </svg>
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

/** The site's one button shape: a flat rectangle with a glyph that nudges on hover. */
export default function ActionLink({ href, children, icon = "right", variant = "solid", size = "md", className = "" }: Props) {
  const cls = `act ${variant === "ghost" ? "act-ghost" : ""} ${size === "sm" ? "act-sm" : ""} ${className}`;
  const [hx, hy] = NUDGE[icon];
  const style = { "--hx": hx, "--hy": hy } as React.CSSProperties;
  const inner = (
    <>
      {children}
      <Glyph icon={icon} />
    </>
  );
  // files in /public are plain downloads, not routes
  if (href.endsWith(".pdf")) {
    return (
      <a href={href} download className={cls} style={style}>
        {inner}
      </a>
    );
  }
  return /^(https?:|mailto:)/.test(href) ? (
    <a href={href} className={cls} style={style} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls} style={style}>
      {inner}
    </Link>
  );
}
