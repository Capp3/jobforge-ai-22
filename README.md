# JobForge AI - Local Job Hunting Automation

A simplified, self-contained job hunting automation system built with React, TypeScript, and SQLite. Perfect for local use without external dependencies.

## Features

- 📊 **Job Management**: Track job applications with status updates
- 🔍 **Smart Filtering**: AI-powered job filtering based on your preferences  
- 📋 **Preferences System**: Configure your job search criteria
- 💾 **Local Storage**: SQLite database for complete data ownership
- 🖥️ **Single User**: Designed for personal use, no authentication needed

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + SQLite + better-sqlite3
- **UI Components**: shadcn/ui + Radix UI
- **Database**: SQLite (local file-based)

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation & Setup

1. **Clone and install dependencies:**
```bash
git clone <your-repo>
cd jobforge-ai
npm install
```

2. **Start the development servers:**
```bash
# Start both frontend and backend together
npm run dev:full

# Or start them separately:
npm run server:dev  # Backend API (port 3001)
npm run dev         # Frontend (port 5173)
```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/api/health

### Database

The SQLite database (`data/jobforge.db`) is automatically created on first run. No setup required!

## Project Structure

```
jobforge-ai/
├── src/                    # Frontend React application
│   ├── components/         # UI components
│   ├── pages/             # Main application pages
│   ├── services/          # API client services
│   └── types/             # TypeScript definitions
├── server/                # Backend Express API
│   ├── database.ts        # SQLite database setup
│   ├── routes/           # API route handlers
│   └── server.ts         # Express server
├── data/                 # SQLite database files (auto-created)
└── docs/                 # Documentation
```

## API Endpoints

The backend provides a REST API:

### Jobs
- `GET /api/jobs` - Get all jobs (with filtering)
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/stats/status-counts` - Get job counts by status

### Preferences  
- `GET /api/preferences` - Get user preferences
- `POST /api/preferences` - Create preferences
- `PUT /api/preferences/:id` - Update preferences
- `POST /api/preferences/defaults` - Get or create default preferences

## Configuration

### Job Preferences
Configure your job search criteria in the "Preferences" tab:
- **Locations**: Preferred work locations
- **Work Mode**: Remote, hybrid, or on-site
- **Salary Range**: Expected salary range
- **Career Level**: Junior, mid, senior, etc.
- **Tech Stack**: Preferred technologies
- **Company Size**: Startup, medium, large, enterprise

### LLM Configuration (Future)
The app is designed to integrate with:
- **Ollama**: For local AI processing
- **Advanced AI Models**: For detailed job analysis

## Development

### Available Scripts

- `npm run dev` - Start frontend only (port 5173)
- `npm run server:dev` - Start backend only (port 3001)  
- `npm run dev:full` - Start both frontend and backend
- `npm run build` - Build frontend for production
- `npm run build:server` - Build backend for production
- `npm run start:prod` - Start production server

### Building for Production
```bash
# Build frontend
npm run build

# Build and start production server
npm run build:server
npm run start:prod
```

### Database Management

The SQLite database includes these tables:
- `jobs` - Job listings and application status
- `preferences` - User preferences and settings
- `rss_feeds` - RSS feed sources (future)
- `processing_stats` - Algorithm performance metrics (future)

## Troubleshooting

### Common Issues

1. **Backend won't start:**
   - Check if port 3001 is available
   - Ensure SQLite files can be created in `data/` directory

2. **Frontend can't connect to backend:**
   - Verify backend is running on port 3001
   - Check API client configuration in `src/services/apiClient.ts`

3. **Database issues:**
   - Delete `data/jobforge.db` to reset database
   - Check file permissions in `data/` directory

### Development Tips

- Use browser dev tools for frontend debugging
- Check backend logs in the terminal
- SQLite database can be inspected with DB Browser for SQLite

## Future Enhancements

This is a simplified version. Future features could include:

1. **RSS Processing**: Automatically fetch jobs from RSS feeds
2. **AI Integration**: Smart job filtering with Ollama/OpenAI
3. **Email Notifications**: Automated job alerts
4. **Analytics**: Job market insights and trends
5. **Import/Export**: Backup and restore functionality

## Migration from Supabase

This app was originally built with Supabase and has been simplified to use SQLite. The frontend UI and business logic remain unchanged - only the data layer was modified.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

This is a personal project, but suggestions and improvements are welcome!

---

**Note**: This is a local-only application designed for personal use. It's not intended for multi-user or production deployment on the internet.
