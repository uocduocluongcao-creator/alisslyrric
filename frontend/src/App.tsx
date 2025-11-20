import "./App.css";
import { useEffect, useMemo } from "react";
import { UploadForm } from "./components/UploadForm";
import { useJobs } from "./hooks/useJobs";
import { JobTable } from "./components/JobTable";
import { JobDetail } from "./components/JobDetail";
import { useJobStore } from "./store/useJobStore";

function App() {
  const { jobs, isLoading, error, createJob } = useJobs();
  const { selectedJob, setSelectedJob } = useJobStore();
  const currentJob = useMemo(
    () => jobs.find((job) => job.id === selectedJob?.id) ?? selectedJob,
    [jobs, selectedJob]
  );

  useEffect(() => {
    if (!selectedJob && jobs.length) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs, selectedJob, setSelectedJob]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Lyric video studio</p>
          <h1>Auto lyric video pipeline</h1>
          <p className="muted">
            Upload songs, watch transcription/align/render progress, and download the final MP4.
          </p>
        </div>
      </header>
      <main className="app-main">
        <UploadForm createJob={createJob} />
        <section className="panel">
          <header className="panel-header">
            <div>
              <p className="eyebrow">Jobs</p>
              <h2>Processing queue</h2>
            </div>
          </header>
          {isLoading && <p className="muted">Loading jobs…</p>}
          {error && <p className="error-text">{(error as Error).message}</p>}
          {!isLoading && !error && (
            <JobTable
              jobs={jobs}
              selectedJobId={currentJob?.id}
              onSelect={(job) => setSelectedJob(job)}
            />
          )}
        </section>
        <JobDetail job={currentJob} />
      </main>
    </div>
  );
}

export default App;
