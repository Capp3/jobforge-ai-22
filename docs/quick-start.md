# JobForge AI - Quick Start Guide

Get JobForge AI running in under 5 minutes with this simple guide.

## Prerequisites

- **Node.js 18+** and npm installed
- Basic terminal/command line knowledge

## Quick Setup

### 1. Clone and Install
```bash
# Clone the repository
git clone <repository-url> jobforge-ai
cd jobforge-ai

# Install dependencies
npm install
```

### 2. Start the Application
```bash
# Start both frontend and backend
npm run dev:full
```

### 3. Open and Use
- **Frontend**: http://localhost:5173
- **API Health Check**: http://localhost:3001/api/health

That's it! The SQLite database is automatically created on first run.

## What You Get

✅ **Job Tracking**: Add, edit, and track job applications
✅ **Status Management**: Track application progress
✅ **Preferences**: Configure your job search criteria
✅ **Local Storage**: All data stays on your machine
✅ **No Setup**: Database automatically created

## First Steps

1. **Add Your First Job**: Click "Add Job" and enter job details
2. **Set Preferences**: Go to "Preferences" tab to configure your search criteria
3. **Track Progress**: Update job statuses as you apply and interview

## Common Commands

```bash
# Start development
npm run dev:full

# Frontend only
npm run dev

# Backend only  
npm run server:dev

# Build for production
npm run build

# Serve production build
npm run serve
```

## Troubleshooting

**Backend won't start?**
- Check if port 3001 is available
- Try: `PORT=3002 npm run server:dev`

**Frontend can't connect?**
- Ensure backend is running on port 3001
- Check browser console for errors

**Need to reset data?**
```bash
# Stop the server, then:
rm -f data/jobforge.db
npm run server:dev  # Recreates database
```

## What's Next?

- Explore the preferences system to configure your ideal job criteria
- Use the job status tracking to manage your application pipeline
- Check out the full setup guide in `docs/setup-guide.md` for advanced features

---

**Need help?** Check the [Setup Guide](setup-guide.md) or [Troubleshooting](setup-guide.md#troubleshooting) section. 