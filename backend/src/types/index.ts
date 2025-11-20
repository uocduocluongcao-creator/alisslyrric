export type JobStatus =
  | "queued"
  | "transcribing"
  | "aligning"
  | "rendering"
  | "completed"
  | "failed";

export interface LyricLine {
  start: number;
  end: number;
  text: string;
}

export interface JobArtifacts {
  audioPath: string;
  lyricsPath?: string;
  subtitlePath?: string;
  videoPath?: string;
}

export interface LyricJob {
  id: string;
  title: string;
  artist?: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
  artifacts: JobArtifacts;
  params: {
    backgroundStyle: "waveform" | "image" | "solid";
    palette: string;
    textStyle: string;
  };
}


