# JobForge AI Documentation

Welcome to the JobForge AI documentation! This guide will help you set up and run the JobForge AI application with a local SQLite backend - no external dependencies required.

## What is JobForge AI?

JobForge AI is a local-first job application tracking system that helps you manage and organize your job search process with complete privacy and data ownership. Built with modern web technologies, it provides a clean interface for tracking job applications, managing interview processes, and analyzing job opportunities.

## Key Features

- **Job Tracking**: Keep track of all your job applications in one place
- **AI-Ready Architecture**: Designed for future integration with local AI models (Ollama)
- **Status Management**: Track applications through different stages (pending, applied, interview, rejected, offer)
- **Local-First**: Runs entirely on your machine with SQLite storage
- **Privacy-Focused**: Your job hunting data stays completely local
- **Zero Setup**: Automatic database creation and configuration

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js + SQLite (better-sqlite3)
- **Database**: SQLite (local file-based storage)
- **Development**: Concurrent dev servers with hot reload

## Quick Start

Get started in under 5 minutes:

1. **[Quick Start Guide](quick-start.md)** - 3-step setup process
2. **[Setup Guide](setup-guide.md)** - Comprehensive installation guide
3. **[Database Guide](database-setup-guide.md)** - Database schema and management

## Documentation Structure

### Getting Started
- **[Quick Start](quick-start.md)** - 5-minute setup guide
- **[Setup Guide](setup-guide.md)** - Comprehensive setup instructions

### System Information
- **[Architecture](architecture.md)** - System design and technical decisions
- **[Database Setup](database-setup-guide.md)** - SQLite schema and management
- **[Job Hunting Journey](job-hunting-journey.md)** - Job hunting automation process flow
- **[LLM Prompts](prompts.md)** - AI prompt specifications and variables

### Development
- **[Tasks](tasks.md)** - Current roadmap and future enhancements
- **[Project Brief](projectbrief.md)** - Project requirements and vision
- **[CI/CD Pipeline](ci-cd-guide.md)** - Continuous integration and deployment

### Documentation
- **[Documentation Cleanup Summary](documentation-cleanup-summary.md)** - Recent documentation cleanup report
- **[GitHub Pages Setup](github-pages-setup.md)** - Documentation hosting setup

## Architecture Highlights

### Local-First Design
- **SQLite Database**: Single file storage with ACID compliance
- **Express.js API**: Lightweight REST API for data operations
- **React Frontend**: Modern UI with React Query for state management
- **Zero Dependencies**: No cloud services or external APIs required

### Performance Benefits
- **Sub-10ms API responses** (local database queries)
- **Instant setup** (automatic database initialization)
- **Offline capability** (works without internet)
- **Fast development** (no network latency)

## Prerequisites

- **Node.js 18+** and npm
- **5 minutes** for complete setup
- **Basic terminal knowledge**

## Quick Commands

```bash
# Clone and install
git clone <repo> && cd jobforge-ai && npm install

# Start application
npm run dev:full

# Build for production
npm run build
```

## Support

If you encounter any issues:

1. Check the **[Quick Start Guide](quick-start.md)** for common setup issues
2. Review the **[Setup Guide](setup-guide.md)** troubleshooting section
4. Open an issue on the GitHub repository

## Current Development Focus

We're currently implementing these core functionality areas:

1. **Application Logic Flow**: Creating a seamless job hunting workflow
2. **LLM Integration**: Adding AI-powered job analysis and matching
3. **Dashboard Implementation**: Enhancing the user interface
4. **RSS Feed Integration**: Automating job discovery
5. **Email Notification System**: Keeping users informed

See the [Tasks](tasks.md) page for the detailed implementation plan.

---

*Documentation Version: 2.0 (SQLite Architecture)*  
*Last updated: {{ git_revision_date_localized }}* 