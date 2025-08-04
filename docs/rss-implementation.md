# RSS Feed Integration Implementation

## Overview

JobForge AI now includes comprehensive RSS feed integration for automated job discovery. This implementation allows users to configure RSS feeds that are automatically processed to discover new job opportunities.

## Features Implemented

### ✅ RSS Feed Management
- **CRUD Operations**: Create, read, update, delete RSS feeds
- **Enable/Disable**: Toggle feeds on/off without deletion
- **Categories**: Organize feeds by categories (Technology, Remote, etc.)
- **Feed Validation**: URL format validation and RSS feed detection

### ✅ RSS Processing Engine
- **Smart Parsing**: Extracts job title, company, location, description
- **Multiple Formats**: Supports various RSS feed formats and structures
- **Error Handling**: Robust error handling with status tracking
- **Rate Limiting**: 2-second delays between feed processing to be respectful

### ✅ Duplicate Detection
- **URL Matching**: Prevents exact URL duplicates
- **Title+Company**: Detects similar jobs by title and company
- **Time Window**: Only checks duplicates within 30 days
- **Error Tolerance**: Errs on the side of keeping questionable matches

### ✅ Job Pipeline Integration
- **Status Flow**: RSS jobs start with 'new' status
- **LLM Analysis**: Goes through same LLM pipeline as manual jobs
- **Source Attribution**: Jobs tagged with source feed information
- **Standard Workflow**: Follows normal job processing workflow

### ✅ Management Interface
- **Configuration Tab**: Integrated into main configuration interface
- **Feed Status**: Visual indicators for feed health and last fetch time
- **Manual Processing**: Trigger individual feeds or process all feeds
- **Real-time Feedback**: Toast notifications for all operations

## API Endpoints

### RSS Feed Management
```
GET    /api/rss              # Get all RSS feeds
GET    /api/rss/:id          # Get single RSS feed
POST   /api/rss              # Create new RSS feed
PUT    /api/rss/:id          # Update RSS feed
DELETE /api/rss/:id          # Delete RSS feed
```

### RSS Processing
```
POST   /api/rss-processor/process           # Process all enabled feeds
POST   /api/rss-processor/process/:feedId   # Process single feed
GET    /api/rss-processor/status            # Get processor status
```

## Database Schema

### RSS Feeds Table
```sql
CREATE TABLE rss_feeds (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  enabled INTEGER DEFAULT 1,
  category TEXT,
  last_fetched TEXT,
  last_fetch_status TEXT,
  last_error TEXT,
  job_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

## Usage Instructions

### Adding RSS Feeds
1. Navigate to **Configuration > RSS Feeds**
2. Click **Add RSS Feed**
3. Enter feed name, URL, and optional category
4. Click **Add Feed**

### Managing Feeds
- **Toggle Enable/Disable**: Use the switch next to each feed
- **Manual Refresh**: Click refresh button to process single feed
- **Process All**: Use "Process All Feeds" button for bulk processing
- **Delete**: Use trash button to remove feeds

### Feed Processing
- Feeds are processed manually via the interface
- Each job is checked for duplicates before saving
- Jobs flow through normal LLM analysis pipeline
- Source attribution is automatically added

## Technical Implementation

### RSS Parser
- Uses `rss-parser` library for robust RSS parsing
- Handles multiple RSS formats and custom fields
- Extracts job information using pattern matching
- Cleans HTML and truncates long descriptions

### Duplicate Detection Strategy
```typescript
// 1. Check for exact URL match
const urlMatch = db.prepare('SELECT id FROM jobs WHERE original_url = ?').get(job.link);

// 2. Check for title + company match within 30 days
const titleCompanyMatch = db.prepare(`
  SELECT id FROM jobs 
  WHERE LOWER(title) = LOWER(?) 
  AND LOWER(company) = LOWER(?)
  AND created_at > datetime('now', '-30 days')
`).get(job.title, job.company);
```

### Error Handling
- Network timeouts and failed requests are logged
- Feed status tracking for monitoring
- Graceful degradation when feeds are unavailable
- User feedback via toast notifications

## Current Status

### ✅ Completed
- RSS feed CRUD operations
- Feed management interface
- RSS parsing and job extraction
- Duplicate detection
- Manual processing triggers
- Status monitoring and error tracking

### 🚧 Remaining Tasks
- Scheduled automatic processing (cron jobs)
- Initial set of high-quality RSS feeds
- Advanced filtering rules per feed
- Performance optimization for large feeds

## Future Enhancements

### Planned Features
1. **Scheduled Processing**: Automatic feed processing with configurable intervals
2. **Feed Templates**: Pre-configured feeds for popular job sites
3. **Advanced Filtering**: Per-feed filtering rules and keywords
4. **Performance Monitoring**: Processing time and success rate tracking
5. **Bulk Import**: Import multiple feeds from OPML files

### Integration Points
- **Email Notifications**: Alert users when new jobs are found via RSS
- **LLM Configuration**: Feed-specific LLM analysis settings
- **User Preferences**: RSS-specific filtering based on user preferences

This implementation provides a solid foundation for automated job discovery while maintaining the quality and workflow of the existing system.