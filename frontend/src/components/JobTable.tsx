import type { LyricJob } from "../types/jobs";
import { StatusBadge } from "./StatusBadge";

interface Props {
  jobs: LyricJob[];
  selectedJobId?: string;
  onSelect: (job: LyricJob) => void;
}

export const JobTable = ({ jobs, selectedJobId, onSelect }: Props) => {
  if (!jobs.length) {
    return (
      <div className="empty-state">
        <p>No jobs yet. Upload an audio file to start rendering lyric videos.</p>
      </div>
    );
  }
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Created</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr
              key={job.id}
              className={job.id === selectedJobId ? "active" : ""}
              onClick={() => onSelect(job)}
            >
              <td>
                <div className="job-title">
                  <strong>{job.title}</strong>
                  {job.artist && <span>{job.artist}</span>}
                </div>
              </td>
              <td>
                <StatusBadge status={job.status} />
              </td>
              <td>{new Date(job.createdAt).toLocaleString()}</td>
              <td>{new Date(job.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

