"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobWorker = void 0;
const bullmq_1 = require("bullmq");
const fs_1 = __importDefault(require("fs"));
const config_1 = require("../config");
const jobQueue_1 = require("../queue/jobQueue");
const storageService_1 = require("../services/storageService");
const lyricSyncService_1 = require("../services/lyricSyncService");
const videoRenderService_1 = require("../services/videoRenderService");
const logger_1 = require("../logger");
const connection = { url: config_1.config.redisUrl };
const updateStatus = (jobId, status, errorMessage) => storageService_1.storageService.updateJob(jobId, (job) => ({
    ...job,
    status: status,
    updatedAt: new Date().toISOString(),
    errorMessage
}));
exports.jobWorker = new bullmq_1.Worker(jobQueue_1.jobQueue.name, async ({ data }) => {
    const jobRecord = storageService_1.storageService.getJob(data.jobId);
    if (!jobRecord) {
        throw new Error(`Job ${data.jobId} not found`);
    }
    try {
        updateStatus(jobRecord.id, jobRecord.artifacts.lyricsPath ? "aligning" : "transcribing");
        const lines = jobRecord.artifacts.lyricsPath
            ? await lyricSyncService_1.lyricSyncService.alignLyrics(jobRecord.artifacts.audioPath, jobRecord.artifacts.lyricsPath)
            : await lyricSyncService_1.lyricSyncService.transcribeAudio(jobRecord.artifacts.audioPath);
        updateStatus(jobRecord.id, "rendering");
        const subtitlePath = jobRecord.artifacts.subtitlePath;
        await videoRenderService_1.videoRenderService.writeSubtitleFile(lines, subtitlePath);
        const videoPath = jobRecord.artifacts.videoPath;
        await videoRenderService_1.videoRenderService.renderFromAssets({
            audioPath: jobRecord.artifacts.audioPath,
            subtitlePath,
            outputPath: videoPath
        });
        storageService_1.storageService.updateJob(jobRecord.id, (job) => ({
            ...job,
            status: "completed",
            updatedAt: new Date().toISOString()
        }));
    }
    catch (error) {
        logger_1.logger.error("Job failed", { error });
        updateStatus(jobRecord.id, "failed", error.message);
        throw error;
    }
    finally {
        if (jobRecord.artifacts.lyricsPath && fs_1.default.existsSync(jobRecord.artifacts.lyricsPath)) {
            fs_1.default.unlinkSync(jobRecord.artifacts.lyricsPath);
        }
    }
}, { connection });
exports.jobWorker.on("failed", (job, err) => logger_1.logger.error("Worker failed", { jobId: job?.data.jobId, error: err }));
exports.jobWorker.on("completed", (job) => logger_1.logger.info("Worker completed job", { jobId: job.data.jobId }));
