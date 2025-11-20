import { Queue } from "bullmq";
import { config } from "../config";
import { logger } from "../logger";

export type JobQueuePayload = {
  jobId: string;
};

const connection = config.redisUrl;

export const jobQueue = new Queue<JobQueuePayload>("lyric-video-jobs", {
  connection: { url: connection }
});

jobQueue.on("error", (err) => logger.error(`Queue error: ${err.message}`));


