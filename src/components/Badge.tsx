import type { Project, ProjectContentType, ProjectStatus } from "@/lib/projects";

const statusLabel: Record<ProjectStatus, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  done: "Done",
};

const contentTypeLabel: Record<ProjectContentType, string> = {
  docs: "Docs",
  notebook: "Jupyter Notebook",
  code: "Code Snippet",
};

export function TrackBadge({ track }: { track: Project["track"] }) {
  return <span className="chip-brutal bg-accent text-white">{track}</span>;
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return <span className="chip-brutal">{statusLabel[status]}</span>;
}

export function TypeBadge({
  contentType,
  codeLanguage,
}: {
  contentType: ProjectContentType;
  codeLanguage?: string | null;
}) {
  const label =
    contentType === "code" && codeLanguage
      ? `${codeLanguage.toUpperCase()} Snippet`
      : contentTypeLabel[contentType];
  return <span className="chip-brutal">{label}</span>;
}

export function SkillTag({ skill }: { skill: string }) {
  return <span className="chip-brutal font-normal normal-case tracking-normal">{skill}</span>;
}
