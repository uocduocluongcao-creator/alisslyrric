"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = require("./config");
const jobs_1 = require("./routes/jobs");
const logger_1 = require("./logger");
require("./workers/jobWorker");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/jobs", jobs_1.jobsRouter);
app.use((err, _req, res, _next) => {
    logger_1.logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: "Unexpected server error" });
});
app.listen(config_1.config.port, () => {
    logger_1.logger.info(`API running on http://localhost:${config_1.config.port}`);
});
