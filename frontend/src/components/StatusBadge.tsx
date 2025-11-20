import type { JobStatus } from "../types/jobs";
import "./StatusBadge.css";

const statusMap: Record<
  JobStatus,
  { label: string; tone: "gray" | "blue" | "purple" | "orange" | "green" | "red" }
> = {
  queued: { label: "Queued", tone: "gray" },
  transcribing: { label: "Transcribing", tone: "blue" },
  aligning: { label: "Aligning", tone: "purple" },
  rendering: { label: "Rendering", tone: "orange" },
  completed: { label: "Completed", tone: "green" },
  failed: { label: "Failed", tone: "red" }
};

interface Props {
  status: JobStatus;
}

export const StatusBadge = ({ status }: Props) => {
  const tone = statusMap[status];
  return <span className={`status-badge status-${tone.tone}`}>{tone.label}</span>;
};

