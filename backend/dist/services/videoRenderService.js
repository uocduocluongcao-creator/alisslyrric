"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoRenderService = void 0;
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const logger_1 = require("../logger");
const assHeader = `[Script Info]
ScriptType: v4.00+
PlayResX: 1280
PlayResY: 720

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Roboto,48,&H00FFFFFF,&H000000FF,&H00101010,&H64000000,-1,0,0,0,100,100,0,0,1,3,0,2,120,120,50,1

[Events]
Format: Layer, Start, End, Style, Text`;
const toAssTimestamp = (seconds) => {
    const date = new Date(seconds * 1000);
    const hh = String(Math.floor(seconds / 3600)).padStart(1, "0");
    const mm = String(date.getUTCMinutes()).padStart(2, "0");
    const ss = String(date.getUTCSeconds()).padStart(2, "0");
    const cs = String(Math.floor(date.getUTCMilliseconds() / 10)).padStart(2, "0");
    return `${hh}:${mm}:${ss}.${cs}`;
};
const buildDialogue = (lines) => lines
    .map((line) => `Dialogue: 0,${toAssTimestamp(line.start)},${toAssTimestamp(line.end)},Default,${line.text.replace(/\n/g, "\\N")}`)
    .join("\n");
const runFfmpeg = (args) => new Promise((resolve, reject) => {
    const ffmpeg = (0, child_process_1.spawn)(config_1.config.ffmpegPath, args);
    let stderr = "";
    ffmpeg.stderr.on("data", (data) => {
        stderr += data.toString();
    });
    ffmpeg.on("close", (code) => {
        if (code !== 0) {
            logger_1.logger.error("ffmpeg failed", { stderr });
            return reject(new Error(stderr));
        }
        resolve();
    });
});
exports.videoRenderService = {
    async writeSubtitleFile(lines, destination) {
        const content = `${assHeader}\n${buildDialogue(lines)}`;
        fs_1.default.writeFileSync(destination, content, "utf-8");
        return destination;
    },
    async renderFromAssets({ audioPath, subtitlePath, outputPath, backgroundColor = "#050505" }) {
        const durationProbeArgs = [
            "-i",
            audioPath,
            "-show_entries",
            "format=duration",
            "-v",
            "quiet",
            "-of",
            "csv=p=0"
        ];
        const probe = (0, child_process_1.spawn)(config_1.config.ffmpegPath, ["-i", audioPath, "-f", "null", "-"]);
        probe.on("close", () => undefined); // noop, placeholder
        const args = [
            "-y",
            "-f",
            "lavfi",
            "-i",
            `color=${backgroundColor}:s=1280x720`,
            "-i",
            audioPath,
            "-shortest",
            "-vf",
            `subtitles=${path_1.default.normalize(subtitlePath)}`,
            "-c:v",
            "libx264",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            outputPath
        ];
        await runFfmpeg(args);
        return outputPath;
    }
};
