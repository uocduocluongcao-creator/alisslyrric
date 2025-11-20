"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobsRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const jobController_1 = require("../controllers/jobController");
const config_1 = require("../config");
const upload = (0, multer_1.default)({
    dest: path_1.default.join(config_1.config.storageRoot, "uploads"),
    limits: { fileSize: 200 * 1024 * 1024 }
});
exports.jobsRouter = (0, express_1.Router)();
exports.jobsRouter.post("/", upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "lyrics", maxCount: 1 }
]), jobController_1.jobController.createJob);
exports.jobsRouter.get("/", jobController_1.jobController.listJobs);
exports.jobsRouter.get("/:id", jobController_1.jobController.getJob);
exports.jobsRouter.get("/:id/video", jobController_1.jobController.downloadVideo);
exports.jobsRouter.get("/:id/events", jobController_1.jobController.streamProgress);
