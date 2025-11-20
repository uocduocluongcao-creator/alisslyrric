FROM node:20-slim

# Install FFmpeg and Python for Whisper/Gentle scripts
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .
RUN npm run build

# Create storage directories
RUN mkdir -p /app/storage/uploads /app/storage/jobs /app/storage/renders

EXPOSE 4000

CMD ["npm", "start"]

