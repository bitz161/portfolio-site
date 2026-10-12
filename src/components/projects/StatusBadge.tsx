import type { ProjectStatus } from "@/lib/projects";
import { STATUS_LABEL } from "@/lib/site";

const STYLE: Record<ProjectStatus, string> = {
  done: "border-brass/40 text-brass-soft",
  "in-progress": "border-ember/40 text-ember-soft",
  "not-started": "border-line text-muted",
};

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs ${STYLE[status]}`}>
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full bg-current ${status === "in-progress" ? "animate-pulse" : ""}`}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}
