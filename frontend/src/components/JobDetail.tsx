import type { LyricJob } from "../types/jobs";
import { StatusBadge } from "./StatusBadge";
import { jobApi } from "../api/jobs";

interface Props {
  job?: LyricJob;
}

const TimelineStep = ({
  label,
  active,
  done
}: {
  label: string;
  active: boolean;
  done: boolean;
}) => (
  <div className={`timeline-step ${done ? "done" : ""} ${active ? "active" : ""}`}>
    <span>{label}</span>
  </div>
);

const orderedStatuses: { key: LyricJob["status"]; label: string }[] = [
  { key: "queued", label: "Queued" },
  { key: "transcribing", label: "Transcribing" },
  { key: "aligning", label: "Aligning" },
  { key: "rendering", label: "Rendering" },
  { key: "completed", label: "Completed" }
];

export const JobDetail = ({ job }: Props) => {
  if (!job) {
    return (
      <div className="panel detail-panel">
        <p className="empty-state">Select a job to see details.</p>
      </div>
    );
  }

  const statusIndex = orderedStatuses.findIndex((s) => s.key === job.status);

  return (
    <div className="panel detail-panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Job detail</p>
          <h2>{job.title}</h2>
          {job.artist && <p className="muted">{job.artist}</p>}
        </div>
        <StatusBadge status={job.status} />
      </header>
      <div className="timeline">
        {orderedStatuses.map((step, index) => (
          <TimelineStep
            key={step.key}
            label={step.label}
            active={index === statusIndex}
            done={index <= statusIndex && job.status !== "failed"}
          />
        ))}
        {job.status === "failed" && (
          <TimelineStep label="Failed" active done />
        )}
      </div>
      {job.errorMessage && <p className="error-text">{job.errorMessage}</p>}
      <dl className="meta-grid">
        <div>
          <dt>Created</dt>
          <dd>{new Date(job.createdAt).toLocaleString()}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{new Date(job.updatedAt).toLocaleString()}</dd>
        </div>
      </dl>
      {job.status === "completed" && (
        <a className="primary-btn" href={jobApi.downloadUrl(job.id)}>
          Download video
        </a>
      )}
    </div>
  );
};

