# OSS lyric video references

## AI Music Video Generator (`gouveags/ai-music-video-generator`)
- Tech stack: Python orchestration + FFmpeg; integrates OpenAI (lyrics), DALL-E (image), **Suno** (music) and publishes to YouTube/TikTok.
- Reusable ideas: job orchestration for long tasks, multi-service pipeline configuration via `.env`, FFmpeg command templates for overlaying subtitles on generated frames.
- Gaps: tightly coupled to third-party AI services and automation pipelines; no standalone web UI.

## Music2Video (`joeljang/music2video`)
- Generates visuals synced with existing songs using **Wav2CLIP** embeddings + **VQGAN-CLIP** frame synth.
- Provides reference for GPU job queueing, progress tracking, and asset caching.
- Lacks lyric extraction; output is abstract visuals (needs adaptation for text overlays).

## Visual Lyrics (`visual-lyrics/visual-lyrics`)
- Full lyric-video pipeline with text-based control; leverages forced alignment for timestamps and FFmpeg overlays.
- Shows how to convert lyric timecodes into `.ass` subtitle tracks and composite them with backgrounds.
- CLI-only; could extract subtitle-generation logic for Node worker.

## Lyric Wave Architecture (`sergio11/lyric_wave_architecture`)
- Architecture notes on AI-generated vocals + lyrics before rendering MP4.
- Useful for designing modular services (lyrics, vocals, mixing, video).
- No production-ready code but good reference for microservice boundaries.

## Supporting libs/services spotted across repos
- **OpenAI Whisper / Faster-Whisper** for transcription and timestamping (Python/C++ bindings).
- **Gentle** (Kaldi-based aligner) for forced alignment when lyrics already exist.
- **FFmpeg + libass** or **MoviePy** for composing audio + subtitles.
- **BullMQ / Redis** common for Node-based job orchestration.

## Takeaways for our implementation
1. Reuse Whisper (API or container) for automatic lyric/timecode generation, mirroring Visual Lyrics forced-alignment stage.
2. Adopt FFmpeg `.ass` workflow (generate subtitle track → composite) instead of frame-by-frame rendering to keep Node lightweight.
3. Follow AI Music Video Generator’s pattern of storing job metadata + artifacts, but keep storage local per requirement.
4. Provide REST job management similar to Music2Video’s queue status endpoints so the React SPA can poll progress.


