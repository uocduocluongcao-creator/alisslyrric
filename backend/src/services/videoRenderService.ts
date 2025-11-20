import fs from "fs";
import { spawn } from "child_process";
import path from "path";
import { config } from "../config";
import { LyricLine } from "../types";
import { logger } from "../logger";

const assHeader = `[Script Info]
ScriptType: v4.00+
PlayResX: 1280
PlayResY: 720

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Roboto,48,&H00FFFFFF,&H000000FF,&H00101010,&H64000000,-1,0,0,0,100,100,0,0,1,3,0,2,120,120,50,1

[Events]
Format: Layer, Start, End, Style, Text`;

const toAssTimestamp = (seconds: number) => {
  const date = new Date(seconds * 1000);
  const hh = String(Math.floor(seconds / 3600)).padStart(1, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  const cs = String(Math.floor(date.getUTCMilliseconds() / 10)).padStart(2, "0");
  return `${hh}:${mm}:${ss}.${cs}`;
};

const buildDialogue = (lines: LyricLine[]) =>
  lines
    .map(
      (line) =>
        `Dialogue: 0,${toAssTimestamp(line.start)},${toAssTimestamp(
          line.end
        )},Default,${line.text.replace(/\n/g, "\\N")}`
    )
    .join("\n");

const runFfmpeg = (args: string[]) =>
  new Promise<void>((resolve, reject) => {
    const ffmpeg = spawn(config.ffmpegPath, args);
    let stderr = "";
    ffmpeg.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    ffmpeg.on("close", (code) => {
      if (code !== 0) {
        logger.error("ffmpeg failed", { stderr });
        return reject(new Error(stderr));
      }
      resolve();
    });
  });

export const videoRenderService = {
  async writeSubtitleFile(lines: LyricLine[], destination: string) {
    const content = `${assHeader}\n${buildDialogue(lines)}`;
    fs.writeFileSync(destination, content, "utf-8");
    return destination;
  },
  async renderFromAssets({
    audioPath,
    subtitlePath,
    outputPath,
    backgroundColor = "#050505"
  }: {
    audioPath: string;
    subtitlePath: string;
    outputPath: string;
    backgroundColor?: string;
  }) {
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
    const probe = spawn(config.ffmpegPath, ["-i", audioPath, "-f", "null", "-"]);
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
      `subtitles=${path.normalize(subtitlePath)}`,
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


