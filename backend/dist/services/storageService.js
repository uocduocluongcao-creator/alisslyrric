"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const jobDir = path_1.default.join(config_1.config.storageRoot, "jobs");
const jobPath = (id) => path_1.default.join(jobDir, `${id}.json`);
exports.storageService = {
    saveJob(job) {
        fs_1.default.writeFileSync(jobPath(job.id), JSON.stringify(job, null, 2), "utf-8");
        return job;
    },
    updateJob(id, updater) {
        const existing = this.getJob(id);
        if (!existing) {
            throw new Error(`Job ${id} not found`);
        }
        const updated = updater(existing);
        this.saveJob(updated);
        return updated;
    },
    getJob(id) {
        const file = jobPath(id);
        if (!fs_1.default.existsSync(file)) {
            return undefined;
        }
        const raw = fs_1.default.readFileSync(file, "utf-8");
        return JSON.parse(raw);
    },
    listJobs() {
        if (!fs_1.default.existsSync(jobDir)) {
            return [];
        }
        return fs_1.default
            .readdirSync(jobDir)
            .filter((file) => file.endsWith(".json"))
            .map((file) => {
            const raw = fs_1.default.readFileSync(path_1.default.join(jobDir, file), "utf-8");
            return JSON.parse(raw);
        })
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
};
