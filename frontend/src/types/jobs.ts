export type JobStatus =
  | "queued"
  | "transcribing"
  | "aligning"
  | "rendering"
  | "completed"
  | "failed";

export interface LyricJob {
  id: string;
  title: string;
  artist?: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
  artifacts: {
    audioPath: string;
    lyricsPath?: string;
    subtitlePath?: string;
    videoPath?: string;
  };
  params: {
    backgroundStyle: string;
    palette: string;
    textStyle: string;
  };
}

