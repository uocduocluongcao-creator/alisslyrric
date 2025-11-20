import { Worker } from "bullmq";
import fs from "fs";
import { config } from "../config";
import { jobQueue, JobQueuePayload } from "../queue/jobQueue";
import { storageService } from "../services/storageService";
import { lyricSyncService } from "../services/lyricSyncService";
import { videoRenderService } from "../services/videoRenderService";
import { logger } from "../logger";

const connection = { url: config.redisUrl };

const updateStatus = (jobId: string, status: string, errorMessage?: string) =>
  storageService.updateJob(jobId, (job) => ({
    ...job,
    status: status as typeof job.status,
    updatedAt: new Date().toISOString(),
    errorMessage
  }));

export const jobWorker = new Worker<JobQueuePayload>(
  jobQueue.name,
  async ({ data }) => {
    const jobRecord = storageService.getJob(data.jobId);
    if (!jobRecord) {
      throw new Error(`Job ${data.jobId} not found`);
    }

    try {
      updateStatus(jobRecord.id, jobRecord.artifacts.lyricsPath ? "aligning" : "transcribing");
      const lines = jobRecord.artifacts.lyricsPath
        ? await lyricSyncService.alignLyrics(
            jobRecord.artifacts.audioPath,
            jobRecord.artifacts.lyricsPath
          )
        : await lyricSyncService.transcribeAudio(jobRecord.artifacts.audioPath);

      updateStatus(jobRecord.id, "rendering");
      const subtitlePath = jobRecord.artifacts.subtitlePath!;
      await videoRenderService.writeSubtitleFile(lines, subtitlePath);
      const videoPath = jobRecord.artifacts.videoPath!;
      await videoRenderService.renderFromAssets({
        audioPath: jobRecord.artifacts.audioPath,
        subtitlePath,
        outputPath: videoPath
      });

      storageService.updateJob(jobRecord.id, (job) => ({
        ...job,
        status: "completed",
        updatedAt: new Date().toISOString()
      }));
    } catch (error) {
      logger.error("Job failed", { error });
      updateStatus(jobRecord.id, "failed", (error as Error).message);
      throw error;
    } finally {
      if (jobRecord.artifacts.lyricsPath && fs.existsSync(jobRecord.artifacts.lyricsPath)) {
        fs.unlinkSync(jobRecord.artifacts.lyricsPath);
      }
    }
  },
  { connection }
);

jobWorker.on("failed", (job, err) =>
  logger.error("Worker failed", { jobId: job?.data.jobId, error: err })
);

jobWorker.on("completed", (job) =>
  logger.info("Worker completed job", { jobId: job.data.jobId })
);


