# Hướng dẫn Deploy lên Unraid

## Chuẩn bị

1. Đảm bảo Unraid đã cài Docker và có quyền truy cập internet
2. Tạo thư mục cho ứng dụng: `/mnt/user/appdata/lyric-video-webapp`

## Cách 1: Sử dụng Docker Compose (Dễ nhất)

### Bước 1: Clone/Copy code vào Unraid

```bash
cd /mnt/user/appdata
git clone <your-repo-url> lyric-video-webapp
cd lyric-video-webapp
```

Hoặc copy toàn bộ thư mục `lyric-video-webapp` vào `/mnt/user/appdata/`

### Bước 2: Chạy Docker Compose

```bash
cd /mnt/user/appdata/lyric-video-webapp
docker-compose up -d
```

### Bước 3: Kiểm tra

- Frontend: http://your-unraid-ip:3000
- Backend API: http://your-unraid-ip:4000
- Health check: http://your-unraid-ip:4000/health

## Cách 2: Tạo containers riêng trong Unraid UI

### Container 1: Redis

1. Vào **Docker** tab trong Unraid
2. Click **Add Container**
3. Cấu hình:
   - **Name**: `lyric-video-redis`
   - **Repository**: `redis:7-alpine`
   - **Network Type**: `bridge`
   - **Port Mappings**:
     - Container Port: `6379`
     - Host Port: `6379`
   - **Path**:
     - Container Path: `/data`
     - Host Path: `/mnt/user/appdata/lyric-video/redis`

### Container 2: Backend

1. **Build image trước** (hoặc push lên Docker Hub):
   ```bash
   cd /mnt/user/appdata/lyric-video-webapp/backend
   docker build -t lyric-video-backend:latest .
   ```

2. Tạo container:
   - **Name**: `lyric-video-backend`
   - **Repository**: `lyric-video-backend:latest` (hoặc image bạn đã build)
   - **Network Type**: `bridge`
   - **Port Mappings**:
     - Container Port: `4000`
     - Host Port: `4000`
   - **Environment Variables** (Advanced View):
     ```
     NODE_ENV=production
     PORT=4000
     REDIS_URL=redis://lyric-video-redis:6379
     STORAGE_ROOT=/app/storage
     FFMPEG_PATH=ffmpeg
     ```
   - **Path**:
     - `/app/storage` → `/mnt/user/appdata/lyric-video/storage`
     - `/app/scripts` → `/mnt/user/appdata/lyric-video/scripts` (read-only)

### Container 3: Frontend

1. **Build image trước**:
   ```bash
   cd /mnt/user/appdata/lyric-video-webapp/frontend
   docker build --build-arg VITE_API_BASE_URL=/api -t lyric-video-frontend:latest .
   ```

2. Tạo container:
   - **Name**: `lyric-video-frontend`
   - **Repository**: `lyric-video-frontend:latest`
   - **Network Type**: `bridge`
   - **Port Mappings**:
     - Container Port: `80`
     - Host Port: `3000`

## Cấu hình Network

Đảm bảo tất cả 3 containers cùng một network (thường là `bridge`). Backend sẽ kết nối Redis qua hostname `lyric-video-redis`.

## Scripts Python (Tùy chọn)

Nếu bạn muốn sử dụng Whisper/Gentle, cần tạo thư mục scripts:

```bash
mkdir -p /mnt/user/appdata/lyric-video/scripts
```

Sau đó tạo các file:
- `transcribe.py` - Sử dụng Whisper để transcribe audio
- `align.py` - Sử dụng Gentle để align lyrics

Mount thư mục này vào backend container như đã cấu hình ở trên.

## Troubleshooting

### Kiểm tra logs

```bash
docker logs lyric-video-backend
docker logs lyric-video-frontend
docker logs lyric-video-redis
```

### Restart containers

```bash
docker restart lyric-video-backend lyric-video-frontend lyric-video-redis
```

### Kiểm tra network

```bash
docker network inspect bridge
```

Đảm bảo tất cả containers đều trong cùng network.

## Update ứng dụng

```bash
cd /mnt/user/appdata/lyric-video-webapp
git pull
docker-compose build
docker-compose up -d
```

