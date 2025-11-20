import express from "express";
import cors from "cors";
import morgan from "morgan";
import { config } from "./config";
import { jobsRouter } from "./routes/jobs";
import { logger } from "./logger";
import "./workers/jobWorker";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/jobs", jobsRouter);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: "Unexpected server error" });
  }
);

app.listen(config.port, () => {
  logger.info(`API running on http://localhost:${config.port}`);
});


