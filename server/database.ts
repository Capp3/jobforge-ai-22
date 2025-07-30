// SQLite Database Setup
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'jobforge.db');
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
export function initializeDatabase() {
  // Jobs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT,
      salary_range TEXT,
      job_url TEXT,
      description TEXT,
      requirements TEXT,
      ai_rating INTEGER,
      ai_notes TEXT,
      status TEXT DEFAULT 'pending',
      source TEXT,
      date_posted TEXT,
      date_processed TEXT DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      unique_id TEXT UNIQUE,
      rating TEXT,
      reasoning TEXT,
      top_matches TEXT, -- JSON string
      detailed_analysis TEXT, -- JSON string
      emailed BOOLEAN DEFAULT 0,
      processing_error TEXT,
      published_date TEXT
    )
  `);

  // Preferences table
  db.exec(`
    CREATE TABLE IF NOT EXISTS preferences (
      id TEXT PRIMARY KEY,
      preferred_locations TEXT NOT NULL, -- JSON string
      work_mode TEXT NOT NULL, -- JSON string
      travel_willingness TEXT NOT NULL,
      salary_range TEXT NOT NULL,
      career_level TEXT NOT NULL, -- JSON string
      tech_stack TEXT NOT NULL, -- JSON string
      company_size TEXT NOT NULL, -- JSON string
      ollama_endpoint TEXT,
      ollama_model TEXT,
      advanced_ai_model TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // RSS Feeds table
  db.exec(`
    CREATE TABLE IF NOT EXISTS rss_feeds (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      name TEXT NOT NULL,
      active BOOLEAN DEFAULT 1,
      last_processed TEXT,
      processing_error TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Processing Stats table
  db.exec(`
    CREATE TABLE IF NOT EXISTS processing_stats (
      id TEXT PRIMARY KEY,
      run_date TEXT NOT NULL,
      total_jobs_processed INTEGER DEFAULT 0,
      jobs_approved INTEGER DEFAULT 0,
      jobs_filtered INTEGER DEFAULT 0,
      jobs_emailed INTEGER DEFAULT 0,
      processing_time_seconds INTEGER,
      errors_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
    CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
    CREATE INDEX IF NOT EXISTS idx_jobs_unique_id ON jobs(unique_id);
  `);

  console.log('Database initialized successfully');
}

// Helper function to generate UUIDs
export function generateId(): string {
  return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}