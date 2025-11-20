"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobService = void 0;
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const config_1 = require("../config");
const jobQueue_1 = require("../queue/jobQueue");
const storageService_1 = require("./storageService");
const defaultParams = {
    backgroundStyle: "solid",
    palette: "#10131a",
    textStyle: "Default"
};
exports.jobService = {
    async createJob({ title, artist, audioPath, lyricFilePath }) {
        const id = (0, uuid_1.v4)();
        const job = {
            id,
            title,
            artist,
            status: "queued",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            artifacts: {
                audioPath,
                lyricsPath: lyricFilePath,
                subtitlePath: path_1.default.join(config_1.config.storageRoot, "renders", `${id}.ass`),
                videoPath: path_1.default.join(config_1.config.storageRoot, "renders", `${id}.mp4`)
            },
            params: defaultParams
        };
        storageService_1.storageService.saveJob(job);
        await jobQueue_1.jobQueue.add("render", { jobId: id });
        return job;
    },
    getJob(id) {
        return storageService_1.storageService.getJob(id);
    },
    listJobs() {
        return storageService_1.storageService.listJobs();
    }
};
