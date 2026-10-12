import { slugify } from "@/lib/slug";

export type Heading = { depth: 2 | 3; text: string; id: string };

/** Markdown inline syntax -> the plain text react-markdown renders (links, code, emphasis). */
export const plain = (s: string) =>
  s.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[`*_~]/g, "").trim();

/** h2/h3 headings outside code fences, with the same ids <Markdown> gives them. */
export function headings(md: string): Heading[] {
  const out: Heading[] = [];
  let fenced = false;
  for (const line of md.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    const m = !fenced && line.match(/^(##|###)\s+(.+?)\s*#*\s*$/);
    if (m) {
      const text = plain(m[2]);
      out.push({ depth: m[1].length as 2 | 3, text, id: slugify(text) });
    }
  }
  return out;
}

export const readingMinutes = (md: string) => Math.max(1, Math.round(md.split(/\s+/).length / 220));
