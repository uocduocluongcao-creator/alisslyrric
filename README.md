# Auto Lyric Video Webapp

Hệ thống tự động tạo video lyric nhạc với backend Node.js + Express và frontend React.

## Kiến trúc

- **Backend**: Node.js + Express + BullMQ + FFmpeg
- **Frontend**: React + Vite + React Query
- **Queue**: Redis + BullMQ
- **Video Processing**: FFmpeg với Whisper/Gentle cho lyric sync

## Deploy trên Unraid

### Cách 1: Docker Compose (Khuyến nghị)

1. **Clone repository vào thư mục trên Unraid:**
   ```bash
   cd /mnt/user/appdata/lyric-video-webapp
   git clone <your-repo-url> .
   ```

2. **Tạo file `.env` cho backend (tùy chọn):**
   ```bash
   cd backend
   cp env.sample .env
   # Chỉnh sửa .env nếu cần
   ```

3. **Chạy với Docker Compose:**
   ```bash
   docker-compose up -d
   ```

4. **Truy cập ứng dụng:**
   - Frontend: http://your-unraid-ip:3000
   - Backend API: http://your-unraid-ip:4000

### Cách 2: Unraid Docker Templates

1. **Tạo 3 containers riêng biệt:**

   **Redis:**
   - Repository: `redis:7-alpine`
   - Port: `6379:6379`
   - Volume: `/mnt/user/appdata/lyric-video/redis:/data`

   **Backend:**
   - Repository: Build từ `./backend/Dockerfile` hoặc push lên registry
   - Port: `4000:4000`
   - Environment variables (Advanced View):
     ```
     NODE_ENV=production
     PORT=4000
     REDIS_URL=redis://<redis-container-ip>:6379
     STORAGE_ROOT=/app/storage
     FFMPEG_PATH=ffmpeg
     ```
   - Volumes:
     - `/mnt/user/appdata/lyric-video/storage:/app/storage`
     - `/mnt/user/appdata/lyric-video/scripts:/app/scripts:ro`

   **Frontend:**
   - Repository: Build từ `./frontend/Dockerfile` hoặc push lên registry
   - Port: `3000:80`
   - Network: Cùng network với backend

2. **Cấu hình Network:**
   - Đảm bảo tất cả containers cùng một custom network
   - Backend cần kết nối được với Redis qua hostname `redis`

## Yêu cầu hệ thống

- Docker & Docker Compose
- Redis (chạy trong container)
- FFmpeg (có sẵn trong backend image)
- Python 3 (cho Whisper/Gentle scripts - cần tự cài đặt)

## Scripts cần thiết

Backend cần các script Python để xử lý:
- `scripts/transcribe.py` - Whisper transcription
- `scripts/align.py` - Gentle alignment

Bạn cần tự tạo các script này hoặc mount volume chứa scripts vào container.

## Development

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- `POST /api/jobs` - Tạo job mới
- `GET /api/jobs` - Danh sách jobs
- `GET /api/jobs/:id` - Chi tiết job
- `GET /api/jobs/:id/download` - Tải video
- `GET /api/jobs/:id/progress` - SSE stream progress

## License

ISC

