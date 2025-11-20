# Backend architecture

## Tech stack
- **Express + TypeScript**: REST API surface (`src/index.ts`, `routes/jobs.ts`).
- **BullMQ + Redis**: queue long-running render jobs (`src/queue/jobQueue.ts`, `workers/jobWorker.ts`).
- **Whisper/Gentle integration**: shell commands configured via env for transcription/alignment (`services/lyricSyncService.ts`).
- **FFmpeg + libass**: render MP4 with subtitles overlay (`services/videoRenderService.ts`).
- **Local FS storage**: audio uploads, subtitle `.ass`, final video (`services/storageService.ts`).

## Flow
1. **Upload** via `POST /api/jobs` (multer). Audio required, lyrics optional.
2. **Persist metadata** (`storageService.saveJob`) → JSON file under `storage/jobs/{id}.json`.
3. **Enqueue** job to `lyric-video-jobs` queue.
4. **Worker pipeline**:
   - `transcribing` (Whisper) or `aligning` (Gentle) to get timed `LyricLine[]`.
   - `rendering`: create `.ass` subtitles + call FFmpeg to compose background + audio + text.
   - `completed` with downloadable MP4 or `failed` + error recorded.
5. **Download** via `GET /api/jobs/:id/video`.

## Environment variables
| Name | Description | Default |
| --- | --- | --- |
| `PORT` | HTTP port | `4000` |
| `REDIS_URL` | BullMQ connection | `redis://127.0.0.1:6379` |
| `STORAGE_ROOT` | Base directory for uploads/renders | `../storage` |
| `FFMPEG_PATH` | Path to ffmpeg binary | `ffmpeg` |
| `WHISPER_COMMAND` | Command used for transcription | `python ../scripts/transcribe.py --model base` |
| `ALIGNMENT_COMMAND` | Forced-alignment command | `python ../scripts/align.py --model gentle` |

## API endpoints
| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/jobs` | Upload audio + optional lyric text file, returns job |
| `GET` | `/api/jobs` | List jobs sorted by latest |
| `GET` | `/api/jobs/:id` | Job detail |
| `GET` | `/api/jobs/:id/video` | Download rendered MP4 |
| `GET` | `/api/jobs/:id/events` | Server-sent event placeholder for progress |

## Next steps
- Implement actual Whisper/Gentle scripts (currently command placeholders).
- Persist metadata in PostgreSQL (swap out `storageService`).
- Broadcast progress updates via WebSocket/SSE loop instead of single push.


