"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lyricSyncService = void 0;
const child_process_1 = require("child_process");
const logger_1 = require("../logger");
const config_1 = require("../config");
const runProcess = (command, args) => new Promise((resolve, reject) => {
    const child = (0, child_process_1.spawn)(command, args, { shell: true });
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
const parseLines = (raw) => {
    try {
        const parsed = JSON.parse(raw);
        return parsed;
    }
    catch (error) {
        logger_1.logger.error("Failed to parse lyric lines", { error, raw });
        throw error;
    }
};
exports.lyricSyncService = {
    async transcribeAudio(audioPath) {
        const [command, ...rest] = config_1.config.whisperCommand.split(" ");
        const args = [...rest, audioPath, "--output", "json"];
        const result = await runProcess(command, args);
        return parseLines(result);
    },
    async alignLyrics(audioPath, lyricsPath) {
        const [command, ...rest] = config_1.config.alignmentCommand.split(" ");
        const args = [...rest, "--audio", audioPath, "--lyrics", lyricsPath];
        const result = await runProcess(command, args);
        return parseLines(result);
    }
};
