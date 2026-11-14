import type { ProjectStatus } from "@/lib/projects";
import { STATUS_LABEL } from "@/lib/site";

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  return <span className={status === "done" ? "font-medium" : "soft"}>{STATUS_LABEL[status]}</span>;
}
