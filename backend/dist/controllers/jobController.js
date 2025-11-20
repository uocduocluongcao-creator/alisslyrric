"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobController = void 0;
const zod_1 = require("zod");
const fs_1 = __importDefault(require("fs"));
const jobService_1 = require("../services/jobService");
const storageService_1 = require("../services/storageService");
const logger_1 = require("../logger");
const createJobSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    artist: zod_1.z.string().optional()
});
exports.jobController = {
    async createJob(req, res) {
        const parsed = createJobSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json(parsed.error);
        }
        const files = req.files;
        const audio = Array.isArray(files) ? files[0] : files?.["audio"]?.[0];
        if (!audio) {
            return res.status(400).json({ message: "Audio file is required" });
        }
        const lyrics = Array.isArray(files)
            ? undefined
            : files?.["lyrics"]?.[0];
        try {
            const job = await jobService_1.jobService.createJob({
                title: parsed.data.title,
                artist: parsed.data.artist,
                audioPath: audio.path,
                lyricFilePath: lyrics?.path
            });
            return res.status(201).json(job);
        }
        catch (error) {
            logger_1.logger.error("Failed to create job", { error });
            return res.status(500).json({ message: "Failed to enqueue job" });
        }
    },
    listJobs(_req, res) {
        return res.json(jobService_1.jobService.listJobs());
    },
    getJob(req, res) {
        const job = jobService_1.jobService.getJob(req.params.id);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }
        return res.json(job);
    },
    downloadVideo(req, res) {
        const job = storageService_1.storageService.getJob(req.params.id);
        if (!job?.artifacts.videoPath || !fs_1.default.existsSync(job.artifacts.videoPath)) {
            return res.status(404).json({ message: "Video not ready" });
        }
        return res.download(job.artifacts.videoPath, `${job.title.replace(/\s+/g, "_")}.mp4`);
    },
    streamProgress(req, res) {
        const job = storageService_1.storageService.getJob(req.params.id);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.write(`data: ${JSON.stringify({ status: job.status })}\n\n`);
    }
};
