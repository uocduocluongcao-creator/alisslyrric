import path from "path";
import { v4 as uuid } from "uuid";
import { config } from "../config";
import { jobQueue } from "../queue/jobQueue";
import { storageService } from "./storageService";
import { LyricJob } from "../types";

const defaultParams = {
  backgroundStyle: "solid" as const,
  palette: "#10131a",
  textStyle: "Default"
};

export interface CreateJobInput {
  title: string;
  artist?: string;
  audioPath: string;
  lyricFilePath?: string;
}

export const jobService = {
  async createJob({ title, artist, audioPath, lyricFilePath }: CreateJobInput) {
    const id = uuid();
    const job: LyricJob = {
      id,
      title,
      artist,
      status: "queued",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      artifacts: {
        audioPath,
        lyricsPath: lyricFilePath,
        subtitlePath: path.join(config.storageRoot, "renders", `${id}.ass`),
        videoPath: path.join(config.storageRoot, "renders", `${id}.mp4`)
      },
      params: defaultParams
    };
    storageService.saveJob(job);
    await jobQueue.add("render", { jobId: id });
    return job;
  },
  getJob(id: string) {
    return storageService.getJob(id);
  },
  listJobs() {
    return storageService.listJobs();
  }
};


