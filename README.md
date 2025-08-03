# JobForge AI

[![CI Pipeline](https://github.com/YOUR_USERNAME/jobforge/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/jobforge/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)

> A modern, self-contained job hunting automation platform designed for personal use. Track applications, set preferences, and leverage AI-powered filtering—all running locally with complete data ownership.

## 🌟 Features

- **📊 Job Application Tracking** - Complete lifecycle management with status tracking and workflow automation
- **🤖 AI-Powered Analysis** - Two-tier LLM integration (Ollama + Cloud) for intelligent job filtering and detailed analysis
- **📱 Interactive Dashboard** - Tabbed interface with Overview, Job Listings, Pipeline Kanban, and Analytics
- **⚙️ Smart Workflow Management** - Automated application events, follow-up tracking, and interview scheduling
- **💾 Local Data Storage** - SQLite-based storage ensuring complete data privacy and ownership
- **🖥️ Single-User Design** - Streamlined interface optimized for personal job hunting workflows
- **🚀 Modern Tech Stack** - Built with React 18, TypeScript, Express.js, and shadcn/ui for reliability and performance

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Backend** | Express.js, SQLite, better-sqlite3 |
| **UI Framework** | shadcn/ui, Radix UI, @dnd-kit |
| **Database** | SQLite (local file-based) |
| **AI Integration** | Ollama, OpenAI, Anthropic, Gemini, Grok |
| **Build Tools** | Vite, TypeScript, ESLint |

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** (included with Node.js)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/jobforge.git
   cd jobforge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the application:**
   ```bash
   # Start both frontend and backend (recommended)
   npm run dev:full
   
   # Or start them separately:
   npm run server:dev  # Backend API (port 3001)
   npm run dev         # Frontend (port 8080)
   ```

4. **Access the application:**
   - **Main Application**: [http://localhost:8080](http://localhost:8080)
   - **API Health Check**: [http://localhost:3001/api/health](http://localhost:3001/api/health)

The SQLite database is automatically created on first run—no additional setup required!

## 📁 Project Structure

```
jobforge/
├── src/                    # React frontend application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Application pages
│   ├── services/          # API client services
│   └── types/             # TypeScript type definitions
├── server/                # Express.js backend
│   ├── database.ts        # SQLite database configuration
│   ├── routes/           # API route handlers
│   └── server.ts         # Express server setup
├── data/                 # SQLite database storage (auto-created)
├── docs/                 # Project documentation
└── public/               # Static assets
```

## 🔧 Configuration

### Job Search Preferences

Customize your job hunting criteria through the application interface:

| Category | Options |
|----------|---------|
| **Locations** | Preferred work locations and geographic areas |
| **Work Mode** | Remote, hybrid, on-site preferences |
| **Salary Range** | Expected compensation brackets |
| **Experience Level** | Junior, mid-level, senior, executive |
| **Technologies** | Preferred tech stack and programming languages |
| **Company Size** | Startup, SME, enterprise preferences |

### Environment Variables

Copy `.env.sample` to `.env` and customize as needed:

```bash
cp .env.sample .env
```

The `.env` file supports these configuration options:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_PATH=./data/jobforge.db

# API Configuration
API_BASE_URL=http://localhost:3001
```

## 🔌 API Reference

### Jobs Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/jobs` | Retrieve all jobs with optional filtering |
| `GET` | `/api/jobs/:id` | Get specific job details |
| `POST` | `/api/jobs` | Create new job entry |
| `PUT` | `/api/jobs/:id` | Update existing job |
| `DELETE` | `/api/jobs/:id` | Remove job entry |
| `GET` | `/api/jobs/stats/status-counts` | Get application status statistics |
| `GET` | `/api/dashboard` | Get dashboard overview data |
| `GET` | `/api/events` | Get application events |
| `GET` | `/api/follow-ups` | Get pending follow-up actions |
| `GET` | `/api/interviews` | Get scheduled interviews |

### Preferences Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/preferences` | Retrieve user preferences |
| `POST` | `/api/preferences` | Create new preferences |
| `PUT` | `/api/preferences/:id` | Update preferences |
| `POST` | `/api/preferences/defaults` | Initialize default preferences |

### LLM Integration Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/llm-config` | Get saved LLM configuration |
| `POST` | `/api/llm-config` | Save LLM configuration |
| `GET` | `/api/ollama/models` | Get available Ollama models |
| `POST` | `/api/ollama/test` | Test Ollama connection |

## 🏗️ Development

### Available Scripts

**Development Commands:**
```bash
npm run dev          # Start frontend development server
npm run server:dev   # Start backend with hot reload
npm run dev:full     # Start both frontend and backend
```

**Production Commands:**
```bash
npm run build        # Build frontend for production
npm run build:server # Compile backend TypeScript
npm run start:prod   # Start production server
```

**Quality Assurance:**
```bash
npm run lint         # Run ESLint code analysis
npm run preview      # Preview production build
```

### Building for Production

```bash
# 1. Build the frontend
npm run build

# 2. Compile the backend
npm run build:server

# 3. Start the production server
npm run start:prod
```

## 📊 Database Schema

The application uses SQLite with the following core tables:

- **`jobs`** - Job listings and application tracking with AI analysis results
- **`preferences`** - User configuration and search criteria
- **`llm_configurations`** - LLM provider settings and API configurations
- **`application_events`** - Application lifecycle events and milestones
- **`follow_up_actions`** - Scheduled follow-up tasks and reminders
- **`interviews`** - Interview scheduling and preparation tracking
- **`rss_feeds`** - RSS feed sources for job discovery *(planned)*

## 🐛 Troubleshooting

### Common Issues

**Backend Connection Problems:**
- Verify port 3001 is available
- Check that the `data/` directory is writable
- Ensure Node.js version meets requirements

**Frontend API Errors:**
- Confirm backend is running on port 3001
- Check network connectivity between frontend and backend
- Review browser console for detailed error messages

**Database Issues:**
- Delete `data/jobforge.db` to reset the database
- Verify file permissions in the `data/` directory
- Check disk space availability

### Development Tools

- Use browser DevTools for frontend debugging
- Monitor backend logs in the terminal
- Inspect SQLite database with [DB Browser for SQLite](https://sqlitebrowser.org/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🔒 Privacy & Security

JobForge AI is designed with privacy in mind:

- **Local-Only Operation**: All data remains on your machine
- **No External Dependencies**: No third-party services required for core functionality
- **Data Ownership**: Complete control over your job hunting data
- **Self-Contained**: Runs independently without internet connectivity for basic features

---

**Built with ❤️ for job hunters who value privacy and control over their data.**
