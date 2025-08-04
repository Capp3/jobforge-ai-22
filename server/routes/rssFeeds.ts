// RSS Feed Management API Routes
import { Router } from 'express';
import { db, generateId } from '../database.js';

const router = Router();

// RSS Feed database interface
interface RSSFeed {
    id: string;
    name: string;
    url: string;
    enabled: boolean;
    category?: string;
    last_fetched?: string;
    last_fetch_status?: 'success' | 'error';
    last_error?: string;
    job_count?: number;
    created_at: string;
    updated_at: string;
}

// Initialize RSS feeds table
const initializeRSSTable = () => {
    try {
        // Check if table exists and get current structure
        const tableInfo = db.prepare("PRAGMA table_info(rss_feeds)").all();
        const columnNames = tableInfo.map((col: unknown) =>
            typeof col === 'object' && col !== null && 'name' in col ? (col as { name: string }).name : ''
        );

        if (tableInfo.length === 0) {
            // Create new table with all columns
            db.prepare(`
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
        )
      `).run();
        } else {
            // Add missing columns if they don't exist
            const requiredColumns = [
                { name: 'enabled', definition: 'INTEGER DEFAULT 1' },
                { name: 'category', definition: 'TEXT' },
                { name: 'last_fetched', definition: 'TEXT' },
                { name: 'last_fetch_status', definition: 'TEXT' },
                { name: 'last_error', definition: 'TEXT' },
                { name: 'job_count', definition: 'INTEGER DEFAULT 0' }
            ];

            for (const column of requiredColumns) {
                if (!columnNames.includes(column.name)) {
                    console.log(`Adding missing column: ${column.name}`);
                    db.prepare(`ALTER TABLE rss_feeds ADD COLUMN ${column.name} ${column.definition}`).run();
                }
            }
        }

        console.log('RSS feeds table initialized successfully');
    } catch (error) {
        console.error('Error initializing RSS feeds table:', error);
    }
};

// Initialize table on module load
initializeRSSTable();

// Get all RSS feeds
router.get('/', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM rss_feeds ORDER BY created_at DESC');
        const feeds = stmt.all() as RSSFeed[];

        // Convert enabled from INTEGER to boolean
        const processedFeeds = feeds.map(feed => ({
            ...feed,
            enabled: Boolean(feed.enabled)
        }));

        res.json(processedFeeds);
    } catch (error) {
        console.error('Error fetching RSS feeds:', error);
        res.status(500).json({ error: 'Failed to fetch RSS feeds' });
    }
});

// Get single RSS feed
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db.prepare('SELECT * FROM rss_feeds WHERE id = ?');
        const feed = stmt.get(id) as RSSFeed | undefined;

        if (!feed) {
            return res.status(404).json({ error: 'RSS feed not found' });
        }

        res.json({
            ...feed,
            enabled: Boolean(feed.enabled)
        });
    } catch (error) {
        console.error('Error fetching RSS feed:', error);
        res.status(500).json({ error: 'Failed to fetch RSS feed' });
    }
});

// Create new RSS feed
router.post('/', (req, res) => {
    try {
        const { name, url, enabled = true, category } = req.body;

        // Validate required fields
        if (!name || !url) {
            return res.status(400).json({ error: 'Name and URL are required' });
        }

        // Validate URL format (basic check)
        try {
            new URL(url);
        } catch {
            return res.status(400).json({ error: 'Invalid URL format' });
        }

        const now = new Date().toISOString();
        const id = generateId();

        const stmt = db.prepare(`
      INSERT INTO rss_feeds (id, name, url, enabled, category, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(id, name, url, enabled ? 1 : 0, category || null, now, now);

        const newFeed = {
            id,
            name,
            url,
            enabled,
            category,
            created_at: now,
            updated_at: now
        };

        res.status(201).json(newFeed);
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ error: 'RSS feed URL already exists' });
        }

        console.error('Error creating RSS feed:', error);
        res.status(500).json({ error: 'Failed to create RSS feed' });
    }
});

// Update RSS feed
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name, url, enabled, category } = req.body;
        const now = new Date().toISOString();

        // Check if feed exists
        const existingStmt = db.prepare('SELECT id FROM rss_feeds WHERE id = ?');
        const existing = existingStmt.get(id);

        if (!existing) {
            return res.status(404).json({ error: 'RSS feed not found' });
        }

        // Validate URL if provided
        if (url) {
            try {
                new URL(url);
            } catch {
                return res.status(400).json({ error: 'Invalid URL format' });
            }
        }

        const updateStmt = db.prepare(`
      UPDATE rss_feeds 
      SET name = COALESCE(?, name),
          url = COALESCE(?, url),
          enabled = COALESCE(?, enabled),
          category = COALESCE(?, category),
          updated_at = ?
      WHERE id = ?
    `);

        updateStmt.run(
            name || null,
            url || null,
            enabled !== undefined ? (enabled ? 1 : 0) : null,
            category !== undefined ? category : null,
            now,
            id
        );

        // Return updated feed
        const updatedStmt = db.prepare('SELECT * FROM rss_feeds WHERE id = ?');
        const updatedFeed = updatedStmt.get(id) as RSSFeed;

        res.json({
            ...updatedFeed,
            enabled: Boolean(updatedFeed.enabled)
        });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ error: 'RSS feed URL already exists' });
        }

        console.error('Error updating RSS feed:', error);
        res.status(500).json({ error: 'Failed to update RSS feed' });
    }
});

// Delete RSS feed
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;

        const stmt = db.prepare('DELETE FROM rss_feeds WHERE id = ?');
        const result = stmt.run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'RSS feed not found' });
        }

        res.json({ message: 'RSS feed deleted successfully' });
    } catch (error) {
        console.error('Error deleting RSS feed:', error);
        res.status(500).json({ error: 'Failed to delete RSS feed' });
    }
});

// Update feed statistics (used by RSS processor)
export const updateFeedStats = (feedId: string, status: 'success' | 'error', jobCount: number = 0, error?: string) => {
    try {
        const now = new Date().toISOString();
        const stmt = db.prepare(`
      UPDATE rss_feeds 
      SET last_fetched = ?,
          last_fetch_status = ?,
          last_error = ?,
          job_count = job_count + ?,
          updated_at = ?
      WHERE id = ?
    `);

        stmt.run(now, status, error || null, jobCount, now, feedId);
    } catch (error) {
        console.error('Error updating feed stats:', error);
    }
};

export default router;