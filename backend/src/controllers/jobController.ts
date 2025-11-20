import { Request, Response } from "express";
import { z } from "zod";
import fs from "fs";
import { jobService } from "../services/jobService";
import { storageService } from "../services/storageService";
import { logger } from "../logger";

const createJobSchema = z.object({
  title: z.string().min(1),
  artist: z.string().optional()
});

export const jobController = {
  async createJob(req: Request, res: Response) {
    const parsed = createJobSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }
    const files = req.files as
      | Record<string, Express.Multer.File[]>
      | Express.Multer.File[]
      | undefined;
    const audio =
      Array.isArray(files) ? files[0] : (files?.["audio"]?.[0] as Express.Multer.File | undefined);
    if (!audio) {
      return res.status(400).json({ message: "Audio file is required" });
    }
    const lyrics = Array.isArray(files)
      ? undefined
      : (files?.["lyrics"]?.[0] as Express.Multer.File | undefined);
    try {
      const job = await jobService.createJob({
        title: parsed.data.title,
        artist: parsed.data.artist,
        audioPath: audio.path,
        lyricFilePath: lyrics?.path
      });
      return res.status(201).json(job);
    } catch (error) {
      logger.error("Failed to create job", { error });
      return res.status(500).json({ message: "Failed to enqueue job" });
    }
  },
  listJobs(_req: Request, res: Response) {
    return res.json(jobService.listJobs());
  },
  getJob(req: Request, res: Response) {
    const job = jobService.getJob(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    return res.json(job);
  },
  downloadVideo(req: Request, res: Response) {
    const job = storageService.getJob(req.params.id);
    if (!job?.artifacts.videoPath || !fs.existsSync(job.artifacts.videoPath)) {
      return res.status(404).json({ message: "Video not ready" });
    }
    return res.download(
      job.artifacts.videoPath,
      `${job.title.replace(/\s+/g, "_")}.mp4`
    );
  },
  streamProgress(req: Request, res: Response) {
    const job = storageService.getJob(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.write(`data: ${JSON.stringify({ status: job.status })}\n\n`);
  }
};


