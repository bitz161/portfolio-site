/** Wraps a pasted or uploaded code snippet (SQL, Python, Bash, etc.) as a
 * single fenced code block tagged with its language, so it renders through
 * the same details_markdown pipeline as everything else. */
export function codeToMarkdown(source: string, language: string): string {
  const fenceLang = language.trim() || "text";
  return "```" + fenceLang + "\n" + source.trimEnd() + "\n```";
}
