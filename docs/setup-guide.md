# JobForge AI - Setup Guide

This guide provides comprehensive instructions for setting up and running the JobForge AI application with SQLite database and Express.js backend.

## Overview

JobForge AI is a local job application tracking system built with:
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js + SQLite (better-sqlite3)
- **Database**: SQLite (local file-based storage)

This setup is completely local with no external dependencies, giving you full control over your job hunting data.

## Prerequisites

- **Node.js 18+** and npm (or yarn/pnpm)
- **Basic understanding** of React and REST APIs (optional but helpful)

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url> jobforge-ai
cd jobforge-ai

# Install all dependencies
npm install
```

### 2. Environment Configuration

The application uses minimal configuration. Create a `.env` file if you need to customize settings:

```bash
# Optional: Custom backend port (defaults to 3001)
PORT=3001

# Optional: Custom database path (defaults to data/jobforge.db)
# DB_PATH=./data/jobforge.db
```

### 3. Start the Application

#### Option A: Start Both Frontend and Backend Together (Recommended)
```bash
npm run dev:full
```

This starts:
- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:5173

#### Option B: Start Services Separately
```bash
# Terminal 1: Start backend API
npm run server:dev

# Terminal 2: Start frontend (in another terminal)
npm run dev
```

### 4. Verify Installation

1. **Health Check**: Visit http://localhost:3001/api/health
   - Should return: `{"status":"OK","message":"JobForge API is running"}`

2. **Frontend**: Visit http://localhost:5173
   - Should show the JobForge AI dashboard

3. **Database**: The SQLite database is automatically created at `data/jobforge.db`

## Database Setup

The SQLite database is automatically initialized when you first start the backend server. No manual setup required!

### Automatic Database Creation

On first startup, the system creates:
- `data/` directory (if it doesn't exist)
- `data/jobforge.db` SQLite database file
- All required tables and indexes

### Database Schema

The following tables are automatically created:

1. **jobs** - Job listings and application tracking
2. **preferences** - User job search preferences
3. **rss_feeds** - RSS feed sources (for future automation)
4. **processing_stats** - Algorithm performance metrics (for future use)

## Available Scripts

### Development Scripts
- `npm run dev` - Start frontend only (port 5173)
- `npm run server:dev` - Start backend only (port 3001)
- `npm run dev:full` - Start both frontend and backend concurrently

### Production Scripts
- `npm run build` - Build frontend for production
- `npm run build:server` - Build backend TypeScript
- `npm run start:prod` - Start production server
- `npm run serve` - Serve built frontend with http-server

### Utility Scripts
- `npm run lint` - Run ESLint code quality checks
- `npm run preview` - Preview production build locally

## Production Deployment

### Building for Production

```bash
# Build the frontend
npm run build

# Build the backend (if using TypeScript compilation)
npm run build:server

# Start production server (serves both frontend and API)
npm run start:prod
```

The production server:
- Serves the built React app from the `/dist` directory
- Provides API endpoints at `/api/*`
- Runs on port 3001 (or configured PORT)

### Alternative Production Serving

You can also serve the frontend separately:

```bash
# Build frontend
npm run build

# Serve with http-server
npm run serve
# Frontend available at: http://localhost:8080
# Backend still needs: npm run server:dev
```

## Configuration

### Application Settings

Most configuration is handled through the UI in the "Preferences" tab:

- **Job Search Criteria**: Locations, salary range, career level
- **Work Preferences**: Remote, hybrid, on-site preferences
- **Technology Stack**: Preferred programming languages and tools
- **Company Preferences**: Company size preferences
- **AI Configuration**: Ollama endpoint and model settings (for future AI features)

### Environment Variables

```bash
# .env file (optional)
PORT=3001                           # Backend server port
NODE_ENV=development               # Environment mode
```

## API Documentation

The backend provides a REST API for the frontend:

### Jobs Endpoints
- `GET /api/jobs` - Get all jobs (supports filtering by status, search, pagination)
- `GET /api/jobs/:id` - Get specific job
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/stats/status-counts` - Get job count statistics

### Preferences Endpoints
- `GET /api/preferences` - Get user preferences
- `POST /api/preferences` - Create new preferences
- `PUT /api/preferences/:id` - Update preferences
- `POST /api/preferences/defaults` - Get or create default preferences

### System Endpoints
- `GET /api/health` - Health check endpoint

## Troubleshooting

### Common Issues

1. **Backend won't start:**
   ```bash
   # Check if port 3001 is in use
   lsof -i :3001
   
   # Use different port
   PORT=3002 npm run server:dev
   ```

2. **Frontend can't connect to backend:**
   - Ensure backend is running on port 3001
   - Check the API client configuration in `src/services/apiClient.ts`
   - Verify CORS is properly configured

3. **Database issues:**
   ```bash
   # Reset database (deletes all data!)
   rm -f data/jobforge.db
   
   # Restart server to recreate database
   npm run server:dev
   ```

4. **Permission errors:**
   ```bash
   # Ensure write permissions for data directory
   chmod 755 data/
   chmod 644 data/jobforge.db
   ```

### Development Tips

- **Backend logs**: Check terminal running `npm run server:dev` for API errors
- **Frontend errors**: Use browser developer tools console
- **Database inspection**: Use DB Browser for SQLite or similar tools to inspect `data/jobforge.db`
- **API testing**: Use curl, Postman, or browser to test API endpoints

### Performance Optimization

- SQLite is extremely fast for this use case (single user, local access)
- The database automatically creates indexes for commonly queried fields
- React Query provides efficient caching and optimistic updates
- Vite offers fast development builds and hot module replacement

## Data Management

### Backup
```bash
# Simple backup
cp data/jobforge.db data/jobforge-backup-$(date +%Y%m%d).db

# Or create a backup directory
mkdir -p backups
cp data/jobforge.db backups/jobforge-$(date +%Y%m%d-%H%M%S).db
```

### Restore
```bash
# Stop the server first, then:
cp backups/jobforge-20240101-120000.db data/jobforge.db
```

### Export/Import (Future Feature)
The application architecture supports future export/import functionality for migrating data between instances.

## Security Notes

This application is designed for local, single-user use:
- No authentication system (not needed for local use)
- Database is local file with filesystem permissions
- API server only accepts local connections
- All data stays on your local machine

## Future Enhancements

The current architecture supports planned features:
1. **AI Integration**: Ollama/OpenAI for intelligent job filtering
2. **RSS Processing**: Automated job feed monitoring
3. **Email Notifications**: Job alert system
4. **Analytics**: Job market insights and trends
5. **Import/Export**: Data portability features

## Getting Help

If you encounter issues:
1. Check this setup guide
2. Review the troubleshooting section
3. Check the project repository for issues
4. Ensure you're using Node.js 18+ and latest npm

---

**Note**: This is a local-only application designed for personal use. It's not intended for multi-user deployment or internet-facing use. 