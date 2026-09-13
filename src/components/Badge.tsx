import type { Project, ProjectContentType, ProjectStatus } from "@/lib/projects";

const statusLabel: Record<ProjectStatus, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  done: "Done",
};

const statusBadgeClass: Record<ProjectStatus, string> = {
  "not-started": "badge-not-started",
  "in-progress": "badge-in-progress",
  done: "badge-done",
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
  return (
    <span className={`px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest ${statusBadgeClass[status]}`}>
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
  return <span className="chip-brutal">{label}</span>;
}

export function SkillTag({ skill }: { skill: string }) {
  return <span className="chip-brutal font-normal normal-case tracking-normal">{skill}</span>;
}
