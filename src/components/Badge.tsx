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
  return (
    <span className="text-xs font-semibold uppercase tracking-wide text-accent">
      {track}
    </span>
  );
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className="inline-block border border-border-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-muted">
      {statusLabel[status]}
    </span>
  );
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
  return (
    <span className="inline-block border border-border-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-muted">
      {label}
    </span>
  );
}

export function SkillTag({ skill }: { skill: string }) {
  return (
    <span className="border border-border-soft px-2.5 py-0.5 text-xs text-muted">
      {skill}
    </span>
  );
}
