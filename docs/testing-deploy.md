# Testing & deployment checklist

## Manual verification
1. **Environment prep**
   - Install Redis (`redis-server`).
   - Install FFmpeg and ensure binary path matches `FFMPEG_PATH`.
   - Provide Whisper/forced-alignment scripts referenced in `.env`.
   - `cd backend && cp env.sample .env && npm install`.
2. **Start services**
   - `npm run dev` (backend) – spawns API + worker in same process.
   - `npm run dev` (frontend) – Vite dev server (requires Node ≥20.19 as Vite 7 warns).
3. **Functional flow**
   - POST job through UI with audio only → expect `transcribing → rendering → completed`.
   - Upload audio + `.txt` lyric file → expect status begins at `aligning`.
   - Download MP4 and confirm subtitles render in sync.
   - Force failure (e.g., remove FFmpeg from PATH) to ensure job ends `failed` + error message.

## Automated hooks
- **Backend**: `npm run build` executes `tsc`; add Jest integration tests for services when Whisper/FFmpeg mocks available.
- **Frontend**: `npm run build` (tsc + vite) acts as type-check + bundle. Add Vitest/RTL suites for components when UI stabilizes.
- **E2E (future)**: Use Playwright to upload fixture audio, poll API, and verify video download link.

## Docker blueprint
Create `docker-compose.yml` with:
```yaml
services:
  redis:
    image: redis:7
  backend:
    build: ./backend
    env_file: ./backend/.env
    volumes:
      - ./storage:/app/storage
    depends_on:
      - redis
  frontend:
    build: ./frontend
    environment:
      - VITE_API_BASE_URL=http://backend:4000/api
    depends_on:
      - backend
```
Backend Dockerfile must install FFmpeg + Whisper runtime (Python + models) before running `npm run start`. Frontend Dockerfile uses `npm run build` then serves `dist/` via Nginx or `vite preview --host`.

## Release steps
1. Run `npm run build` in both `backend/` and `frontend/` to ensure clean artifacts.
2. Package backend by copying `dist/`, `package.json`, `package-lock.json`, `.env`.
3. Copy `frontend/dist` to static hosting or container.
4. Provide users `.env` template and instructions for Whisper/Gentle binaries.

