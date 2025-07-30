# Database Setup Guide for JobForge AI

This document outlines the SQLite database structure and setup for the JobForge AI application. The database is automatically created and configured when you start the application.

## Overview

JobForge AI uses SQLite as its database solution, providing:
- **Local storage**: Complete data ownership and privacy
- **Zero configuration**: Automatic setup on first run
- **High performance**: Optimized for single-user applications
- **Portability**: Single file database for easy backup/restore

## Automatic Database Setup

### No Manual Setup Required!

The SQLite database is automatically initialized when you first start the backend server:

```bash
npm run server:dev
# or
npm run dev:full
```

On first startup, the system automatically:
1. Creates the `data/` directory if it doesn't exist
2. Creates the `data/jobforge.db` SQLite database file
3. Sets up all required tables with proper schema
4. Creates indexes for optimal performance
5. Enables foreign key constraints

## Database Schema

### Tables Overview

The database consists of four main tables designed to support current job tracking needs and future automation features:

#### 1. Jobs Table (`jobs`)
Primary table for storing job listings and application tracking data.

```sql
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,              -- Unique job identifier
  title TEXT NOT NULL,              -- Job title
  company TEXT NOT NULL,            -- Company name
  location TEXT,                    -- Job location
  salary_range TEXT,                -- Salary information
  job_url TEXT,                     -- Direct link to job posting
  description TEXT,                 -- Job description
  requirements TEXT,                -- Job requirements
  ai_rating INTEGER,                -- AI-generated rating (1-10)
  ai_notes TEXT,                    -- AI-generated notes
  status TEXT DEFAULT 'pending',   -- Application status
  source TEXT,                      -- Source (RSS feed, manual, etc.)
  date_posted TEXT,                 -- When job was posted
  date_processed TEXT DEFAULT CURRENT_TIMESTAMP,  -- When processed
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,      -- Record creation
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,      -- Last update
  unique_id TEXT UNIQUE,            -- Unique identifier for deduplication
  rating TEXT,                      -- Detailed rating information
  reasoning TEXT,                   -- AI reasoning for decisions
  top_matches TEXT,                 -- JSON: Top skill matches
  detailed_analysis TEXT,           -- JSON: Detailed AI analysis
  emailed BOOLEAN DEFAULT 0,        -- Whether job was emailed
  processing_error TEXT,            -- Any processing errors
  published_date TEXT               -- Original publication date
);
```

#### 2. Preferences Table (`preferences`)
User job search preferences and AI configuration.

```sql
CREATE TABLE preferences (
  id TEXT PRIMARY KEY,              -- Unique preferences identifier
  preferred_locations TEXT NOT NULL,    -- JSON: Preferred locations
  work_mode TEXT NOT NULL,              -- JSON: Remote/hybrid/onsite
  travel_willingness TEXT NOT NULL,     -- Travel preferences
  salary_range TEXT NOT NULL,           -- Expected salary range
  career_level TEXT NOT NULL,           -- JSON: Career level preferences
  tech_stack TEXT NOT NULL,             -- JSON: Technology preferences
  company_size TEXT NOT NULL,           -- JSON: Company size preferences
  ollama_endpoint TEXT,                 -- Ollama API endpoint
  ollama_model TEXT,                    -- Ollama model name
  advanced_ai_model TEXT,               -- Advanced AI model config
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. RSS Feeds Table (`rss_feeds`)
Configuration for RSS feed sources (future automation feature).

```sql
CREATE TABLE rss_feeds (
  id TEXT PRIMARY KEY,              -- Unique feed identifier
  url TEXT NOT NULL,                -- RSS feed URL
  name TEXT NOT NULL,               -- Human-readable feed name
  active BOOLEAN DEFAULT 1,         -- Whether feed is active
  last_processed TEXT,              -- Last processing timestamp
  processing_error TEXT,            -- Last processing error
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. Processing Stats Table (`processing_stats`)
Performance metrics for algorithm processing (future feature).

```sql
CREATE TABLE processing_stats (
  id TEXT PRIMARY KEY,              -- Unique stats record
  run_date TEXT NOT NULL,           -- Processing run date
  total_jobs_processed INTEGER DEFAULT 0,  -- Total jobs processed
  jobs_approved INTEGER DEFAULT 0,         -- Jobs approved by AI
  jobs_filtered INTEGER DEFAULT 0,         -- Jobs filtered out
  jobs_emailed INTEGER DEFAULT 0,          -- Jobs sent via email
  processing_time_seconds INTEGER,         -- Processing duration
  errors_count INTEGER DEFAULT 0,          -- Number of errors
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes for Performance

The database automatically creates these indexes for optimal query performance:

```sql
-- Index on job status for filtering
CREATE INDEX idx_jobs_status ON jobs(status);

-- Index on creation date for sorting
CREATE INDEX idx_jobs_created_at ON jobs(created_at);

-- Index on unique_id for deduplication
CREATE INDEX idx_jobs_unique_id ON jobs(unique_id);
```

## Data Flow and Usage

### Job Status Workflow

Jobs progress through these status values:
- `pending` - Newly added, not yet reviewed
- `applied` - Application submitted
- `interview` - Interview scheduled/completed
- `rejected` - Application rejected
- `offer` - Job offer received

### JSON Fields

Several fields store JSON data for flexibility:

#### `preferences.preferred_locations`
```json
["Remote", "San Francisco, CA", "New York, NY"]
```

#### `preferences.tech_stack`
```json
["React", "TypeScript", "Node.js", "Python", "PostgreSQL"]
```

#### `jobs.top_matches`
```json
{
  "skills": ["React", "TypeScript"],
  "score": 0.85,
  "missing": ["Python"]
}
```

#### `jobs.detailed_analysis`
```json
{
  "fit_score": 8.5,
  "pros": ["Great tech stack", "Remote work"],
  "cons": ["Lower salary"],
  "recommendation": "Strong match"
}
```

## Database Operations

### Common Queries

#### Get All Active Jobs
```sql
SELECT * FROM jobs 
WHERE status IN ('pending', 'applied', 'interview') 
ORDER BY created_at DESC;
```

#### Get Job Statistics
```sql
SELECT 
  status, 
  COUNT(*) as count 
FROM jobs 
GROUP BY status;
```

#### Find Jobs by Company
```sql
SELECT * FROM jobs 
WHERE company LIKE '%TechCorp%' 
ORDER BY created_at DESC;
```

#### Get User Preferences
```sql
SELECT * FROM preferences 
ORDER BY created_at DESC 
LIMIT 1;
```

### Data Validation

The database uses constraints to ensure data integrity:
- `NOT NULL` constraints on required fields
- `DEFAULT` values for timestamps and status
- `UNIQUE` constraint on `unique_id` for deduplication
- Foreign key constraints (enabled with `PRAGMA foreign_keys = ON`)

## Database Management

### Backup and Restore

#### Create Backup
```bash
# Simple file copy
cp data/jobforge.db backups/jobforge-backup-$(date +%Y%m%d).db

# Using SQLite command (if sqlite3 installed)
sqlite3 data/jobforge.db ".backup backups/jobforge-backup-$(date +%Y%m%d).db"
```

#### Restore from Backup
```bash
# Stop the server first, then:
cp backups/jobforge-backup-20240101.db data/jobforge.db
```

### Database Inspection

#### Using DB Browser for SQLite
1. Download [DB Browser for SQLite](https://sqlitebrowser.org/)
2. Open `data/jobforge.db`
3. Browse tables, run queries, and inspect data

#### Using sqlite3 Command Line
```bash
# Open database
sqlite3 data/jobforge.db

# List tables
.tables

# Describe table structure
.schema jobs

# Run query
SELECT COUNT(*) FROM jobs;

# Exit
.quit
```

### Database Reset

To completely reset the database (⚠️ **This deletes all data!**):

```bash
# Stop the server
# Delete the database file
rm -f data/jobforge.db

# Restart the server (creates fresh database)
npm run server:dev
```

## Performance Characteristics

### SQLite Benefits for This Use Case
- **Fast read operations**: Sub-millisecond queries for typical datasets
- **Efficient writes**: Batched inserts and updates
- **Small footprint**: Minimal memory usage
- **ACID compliance**: Reliable transaction handling
- **Concurrent reads**: Multiple read operations simultaneously

### Scalability Notes
- SQLite easily handles thousands of job records
- Performs well up to hundreds of thousands of records
- Database file size remains manageable (typically <10MB for extensive job data)
- For multi-user scenarios, migration to PostgreSQL would be straightforward

## Security Considerations

### Local-Only Security
- Database file stored locally with filesystem permissions
- No network access to database (only via Express API)
- No user authentication system (designed for single-user use)
- All data remains on local machine

### Recommended Practices
- Regular backups to prevent data loss
- Appropriate file system permissions on `data/` directory
- Consider encryption of backup files for sensitive data

## Migration Support

### From Supabase (Completed)
The application was successfully migrated from Supabase PostgreSQL to SQLite:
- ✅ Schema converted to SQLite format
- ✅ Data types adapted (UUID → TEXT)
- ✅ Constraints and indexes preserved
- ✅ JSON handling maintained

### Future Migration Options
The database structure supports future migrations:
- Export to SQL format for portability
- JSON export/import for data exchange
- Migration scripts for PostgreSQL if needed

## Troubleshooting

### Common Issues

1. **Database locked error**
   ```bash
   # Stop all processes accessing the database
   # Check for orphaned processes
   ps aux | grep node
   ```

2. **Permission denied**
   ```bash
   # Fix directory permissions
   chmod 755 data/
   chmod 644 data/jobforge.db
   ```

3. **Corrupt database**
   ```bash
   # Check database integrity
   sqlite3 data/jobforge.db "PRAGMA integrity_check;"
   
   # If corrupt, restore from backup
   cp backups/latest-backup.db data/jobforge.db
   ```

4. **Missing database file**
   - The database is automatically created on server startup
   - Ensure the server process has write permissions to the `data/` directory

### Performance Issues
- SQLite is optimized for this use case and should perform well
- If experiencing slow queries, check if indexes are being used
- Very large datasets (>100k records) may benefit from additional indexing

## Development Notes

### Adding New Tables
1. Add table creation SQL to `server/database.ts`
2. Add any required indexes
3. Consider migration strategy for existing databases
4. Update API routes as needed

### Schema Changes
- SQLite supports limited schema modifications
- For major changes, consider migration scripts
- Always backup before schema changes
- Test changes thoroughly in development

This SQLite setup provides a robust, performant, and maintainable database solution for JobForge AI's single-user job tracking needs. 