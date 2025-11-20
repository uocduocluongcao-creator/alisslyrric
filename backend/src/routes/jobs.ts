import { Router } from "express";
import multer from "multer";
import path from "path";
import { jobController } from "../controllers/jobController";
import { config } from "../config";

const upload = multer({
  dest: path.join(config.storageRoot, "uploads"),
  limits: { fileSize: 200 * 1024 * 1024 }
});

export const jobsRouter = Router();

jobsRouter.post(
  "/",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "lyrics", maxCount: 1 }
  ]),
  jobController.createJob
);

jobsRouter.get("/", jobController.listJobs);
jobsRouter.get("/:id", jobController.getJob);
jobsRouter.get("/:id/video", jobController.downloadVideo);
jobsRouter.get("/:id/events", jobController.streamProgress);


