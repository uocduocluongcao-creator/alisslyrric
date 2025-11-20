import { spawn } from "child_process";
import { logger } from "../logger";
import { config } from "../config";
import { LyricLine } from "../types";

const runProcess = (command: string, args: string[]) =>
  new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, { shell: true });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(stderr || `Command exited with ${code}`));
      }
      resolve(stdout);
    });
  });

const parseLines = (raw: string) => {
  try {
    const parsed = JSON.parse(raw) as LyricLine[];
    return parsed;
  } catch (error) {
    logger.error("Failed to parse lyric lines", { error, raw });
    throw error;
  }
};

export const lyricSyncService = {
  async transcribeAudio(audioPath: string) {
    const [command, ...rest] = config.whisperCommand.split(" ");
    const args = [...rest, audioPath, "--output", "json"];
    const result = await runProcess(command, args);
    return parseLines(result);
  },
  async alignLyrics(audioPath: string, lyricsPath: string) {
    const [command, ...rest] = config.alignmentCommand.split(" ");
    const args = [...rest, "--audio", audioPath, "--lyrics", lyricsPath];
    const result = await runProcess(command, args);
    return parseLines(result);
  }
};


