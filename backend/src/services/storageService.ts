import fs from "fs";
import path from "path";
import { config } from "../config";
import { LyricJob } from "../types";

const jobDir = path.join(config.storageRoot, "jobs");

const jobPath = (id: string) => path.join(jobDir, `${id}.json`);

export const storageService = {
  saveJob(job: LyricJob) {
    fs.writeFileSync(jobPath(job.id), JSON.stringify(job, null, 2), "utf-8");
    return job;
  },
  updateJob(id: string, updater: (job: LyricJob) => LyricJob) {
    const existing = this.getJob(id);
    if (!existing) {
      throw new Error(`Job ${id} not found`);
    }
    const updated = updater(existing);
    this.saveJob(updated);
    return updated;
  },
  getJob(id: string) {
    const file = jobPath(id);
    if (!fs.existsSync(file)) {
      return undefined;
    }
    const raw = fs.readFileSync(file, "utf-8");
    return JSON.parse(raw) as LyricJob;
  },
  listJobs() {
    if (!fs.existsSync(jobDir)) {
      return [];
    }
    return fs
      .readdirSync(jobDir)
      .filter((file) => file.endsWith(".json"))
      .map((file) => {
        const raw = fs.readFileSync(path.join(jobDir, file), "utf-8");
        return JSON.parse(raw) as LyricJob;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
};


