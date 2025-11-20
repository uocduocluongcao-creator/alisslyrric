"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobQueue = void 0;
const bullmq_1 = require("bullmq");
const config_1 = require("../config");
const logger_1 = require("../logger");
const connection = config_1.config.redisUrl;
exports.jobQueue = new bullmq_1.Queue("lyric-video-jobs", {
    connection: { url: connection }
});
exports.jobQueue.on("error", (err) => logger_1.logger.error(`Queue error: ${err.message}`));
