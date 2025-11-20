import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const resolvePath = (p: string) => path.resolve(process.cwd(), p);

export const config = {
  port: Number(process.env.PORT ?? 4000),
  redisUrl: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
  storageRoot: resolvePath(process.env.STORAGE_ROOT ?? "../storage"),
  ffmpegPath: process.env.FFMPEG_PATH ?? "ffmpeg",
  whisperCommand:
    process.env.WHISPER_COMMAND ??
    "python ../scripts/transcribe.py --model base",
  alignmentCommand:
    process.env.ALIGNMENT_COMMAND ??
    "python ../scripts/align.py --model gentle",
  webhookSecret: process.env.WEBHOOK_SECRET ?? "",
  nodeEnv: process.env.NODE_ENV ?? "development"
};

for (const sub of ["uploads", "jobs", "renders"]) {
  const dir = path.join(config.storageRoot, sub);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}


