"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const resolvePath = (p) => path_1.default.resolve(process.cwd(), p);
exports.config = {
    port: Number(process.env.PORT ?? 4000),
    redisUrl: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
    storageRoot: resolvePath(process.env.STORAGE_ROOT ?? "../storage"),
    ffmpegPath: process.env.FFMPEG_PATH ?? "ffmpeg",
    whisperCommand: process.env.WHISPER_COMMAND ??
        "python ../scripts/transcribe.py --model base",
    alignmentCommand: process.env.ALIGNMENT_COMMAND ??
        "python ../scripts/align.py --model gentle",
    webhookSecret: process.env.WEBHOOK_SECRET ?? "",
    nodeEnv: process.env.NODE_ENV ?? "development"
};
for (const sub of ["uploads", "jobs", "renders"]) {
    const dir = path_1.default.join(exports.config.storageRoot, sub);
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
}
