# Auto Lyric Video Backend

TypeScript Express API + BullMQ worker that turns audio into lyric videos.

## Prerequisites
- Node.js 20+
- Redis (for BullMQ queue)
- FFmpeg available in `PATH`
- Whisper / Gentle scripts referenced in `env.sample`

## Setup
```bash
cp env.sample .env
npm install
npm run dev
```

The dev server listens on `http://localhost:4000`, serves REST endpoints under `/api`.

## Workflow
1. `POST /api/jobs` with multipart form:
   - `audio` (required) MP3/WAV
   - `lyrics` (optional) `.txt` or `.lrc`
   - `title`, `artist` fields
2. Job metadata saved to `storage/jobs/{id}.json` and queued.
3. Worker performs transcription/alignment + renders MP4 via FFmpeg.
4. Download via `GET /api/jobs/:id/video`.

Refer to `../docs/backend-architecture.md` for detailed design.


