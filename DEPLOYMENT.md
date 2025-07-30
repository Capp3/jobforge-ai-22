# JobForge AI - Deployment Guide

Quick deployment guide for JobForge AI with SQLite architecture.

## Development Deployment

### Quick Start
```bash
# Clone and install
git clone <repository-url> jobforge-ai
cd jobforge-ai
npm install

# Start application
npm run dev:full
```

**Ports:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3001

## Production Deployment

### Build and Start
```bash
# Build frontend
npm run build

# Start production server (serves both frontend and API)
npm run start:prod
```

**Single Port:** http://localhost:3001 (serves both UI and API)

### Alternative: Separate Frontend Serving
```bash
# Build frontend
npm run build

# Start backend API
npm run server:dev

# Serve frontend separately
npm run serve
```

**Ports:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3001

## System Requirements

- **Node.js 18+**
- **5-10MB disk space** (excluding node_modules)
- **Minimal RAM** (<100MB typical usage)
- **No external dependencies**

## Database

- **Type:** SQLite (local file)
- **Location:** `data/jobforge.db`
- **Backup:** Simple file copy
- **Reset:** Delete file, auto-recreated on restart

## Environment Variables

Optional configuration in `.env`:

```bash
PORT=3001                    # Backend server port
NODE_ENV=production          # Environment mode
```

## Security Notes

- **Local-only application** - not designed for internet exposure
- **No authentication** - designed for single-user local use
- **File permissions** - protect `data/` directory appropriately

## Backup Strategy

```bash
# Simple backup
cp data/jobforge.db backups/jobforge-$(date +%Y%m%d).db

# Restore
cp backups/jobforge-20240101.db data/jobforge.db
```

## Troubleshooting

**Port conflicts:**
```bash
PORT=3002 npm run start:prod
```

**Database issues:**
```bash
rm -f data/jobforge.db  # Reset database
npm run server:dev      # Auto-recreate
```

**Build issues:**
```bash
rm -rf node_modules dist
npm install
npm run build
```

## Docker (Optional)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "start:prod"]
```

Build and run:
```bash
docker build -t jobforge-ai .
docker run -p 3001:3001 -v $(pwd)/data:/app/data jobforge-ai
```

---

**Note:** This is a local-first application designed for personal use. Not intended for multi-user or internet deployment. 