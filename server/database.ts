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

  // Application Flow Events table
  db.exec(`
    CREATE TABLE IF NOT EXISTS application_events (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      scheduled_date TEXT,
      completed_date TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    )
  `);

  // Follow-up Actions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS follow_up_actions (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      action_type TEXT NOT NULL,
      due_date TEXT NOT NULL,
      completed BOOLEAN DEFAULT 0,
      completed_date TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    )
  `);

  // Interviews table
  db.exec(`
    CREATE TABLE IF NOT EXISTS interviews (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      interview_type TEXT NOT NULL,
      scheduled_date TEXT NOT NULL,
      duration_minutes INTEGER,
      interviewer_name TEXT,
      interviewer_email TEXT,
      location TEXT,
      meeting_link TEXT,
      preparation_notes TEXT,
      feedback_notes TEXT,
      outcome TEXT DEFAULT 'scheduled',
      next_steps TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    )
  `);

  // LLM Configurations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS llm_configurations (
      id TEXT PRIMARY KEY,
      config_data TEXT NOT NULL,
      active BOOLEAN DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // LLM Basic Analysis Results table
  db.exec(`
    CREATE TABLE IF NOT EXISTS llm_analysis_basic (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      rating TEXT NOT NULL,
      reasoning TEXT,
      processing_time_ms REAL,
      model_used TEXT,
      provider TEXT,
      cost_estimate REAL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    )
  `);

  // LLM Detailed Analysis Results table
  db.exec(`
    CREATE TABLE IF NOT EXISTS llm_analysis_detailed (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      analysis_data TEXT NOT NULL,
      processing_time_ms REAL,
      model_used TEXT,
      provider TEXT,
      cost_estimate REAL DEFAULT 0,
      confidence_score REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
    CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
    CREATE INDEX IF NOT EXISTS idx_jobs_unique_id ON jobs(unique_id);
    CREATE INDEX IF NOT EXISTS idx_events_job_id ON application_events(job_id);
    CREATE INDEX IF NOT EXISTS idx_events_scheduled_date ON application_events(scheduled_date);
    CREATE INDEX IF NOT EXISTS idx_follow_ups_job_id ON follow_up_actions(job_id);
    CREATE INDEX IF NOT EXISTS idx_follow_ups_due_date ON follow_up_actions(due_date);
    CREATE INDEX IF NOT EXISTS idx_interviews_job_id ON interviews(job_id);
    CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_date ON interviews(scheduled_date);
    CREATE INDEX IF NOT EXISTS idx_llm_config_active ON llm_configurations(active);
    CREATE INDEX IF NOT EXISTS idx_llm_basic_job_id ON llm_analysis_basic(job_id);
    CREATE INDEX IF NOT EXISTS idx_llm_basic_created_at ON llm_analysis_basic(created_at);
    CREATE INDEX IF NOT EXISTS idx_llm_detailed_job_id ON llm_analysis_detailed(job_id);
    CREATE INDEX IF NOT EXISTS idx_llm_detailed_created_at ON llm_analysis_detailed(created_at);
  `);

  console.log('Database initialized successfully');
}

// Helper function to generate UUIDs
export function generateId(): string {
  return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}