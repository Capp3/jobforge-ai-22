// Jobs API Routes
import { Router } from 'express';
import { db, generateId } from '../database.js';
import type { Job, JobCreate, JobUpdate, JobStatus } from '../../src/types/algorithm.js';

// Database row types (matches SQLite schema)
interface JobRow {
  id: string;
  title: string;
  company: string;
  status: string;
  url?: string;
  description?: string;
  location?: string;
  date_applied?: string;
  follow_up_date?: string;
  notes?: string;
  top_matches?: string; // JSON string
  detailed_analysis?: string; // JSON string
  emailed?: number; // SQLite boolean (0/1)
  date_processed?: string;
}

const router = Router();

// Get all jobs with optional filtering
router.get('/', (req, res) => {
  try {
    const { status, limit, offset, search } = req.query;
    
    let query = 'SELECT * FROM jobs';
    const params: unknown[] = [];
    const conditions: string[] = [];

    // Add status filter
    if (status) {
      const statusArray = Array.isArray(status) ? status : [status];
      const placeholders = statusArray.map(() => '?').join(',');
      conditions.push(`status IN (${placeholders})`);
      params.push(...statusArray);
    }

    // Add search filter
    if (search && typeof search === 'string') {
      conditions.push('(title LIKE ? OR company LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    // Build WHERE clause
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Add ordering
    query += ' ORDER BY created_at DESC';

    // Add pagination
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit as string));
      
      if (offset) {
        query += ' OFFSET ?';
        params.push(parseInt(offset as string));
      }
    }

    const stmt = db.prepare(query);
    const jobs = stmt.all(...params) as JobRow[];

    // Parse JSON fields
    const processedJobs = jobs.map(job => ({
      ...job,
      top_matches: job.top_matches ? JSON.parse(job.top_matches) : null,
      detailed_analysis: job.detailed_analysis ? JSON.parse(job.detailed_analysis) : null,
      emailed: Boolean(job.emailed)
    }));

    res.json(processedJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get single job by ID
router.get('/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM jobs WHERE id = ?');
    const job = stmt.get(req.params.id) as JobRow | undefined;
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Parse JSON fields
    const processedJob = {
      ...job,
      top_matches: job.top_matches ? JSON.parse(job.top_matches) : null,
      detailed_analysis: job.detailed_analysis ? JSON.parse(job.detailed_analysis) : null,
      emailed: Boolean(job.emailed)
    };

    res.json(processedJob);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// Create new job
router.post('/', (req, res) => {
  try {
    const jobData: JobCreate = req.body;
    const id = generateId();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO jobs (
        id, title, company, location, salary_range, job_url, description, 
        requirements, ai_rating, ai_notes, status, source, date_posted,
        unique_id, rating, reasoning, top_matches, detailed_analysis,
        emailed, processing_error, published_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      id,
      jobData.title,
      jobData.company,
      jobData.location || null,
      jobData.salary_range || null,
      jobData.job_url || null,
      jobData.description || null,
      jobData.requirements || null,
      jobData.ai_rating || null,
      jobData.ai_notes || null,
      jobData.status || 'pending',
      jobData.source || null,
      jobData.date_posted || null,
      jobData.unique_id || `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      jobData.rating || null,
      jobData.reasoning || null,
      jobData.top_matches ? JSON.stringify(jobData.top_matches) : null,
      jobData.detailed_analysis ? JSON.stringify(jobData.detailed_analysis) : null,
      jobData.emailed ? 1 : 0,
      jobData.processing_error || null,
      jobData.published_date || null,
      now,
      now
    );

    // Fetch the created job
    const createdJob = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) as JobRow;
    const processedJob = {
      ...createdJob,
      top_matches: createdJob.top_matches ? JSON.parse(createdJob.top_matches) : null,
      detailed_analysis: createdJob.detailed_analysis ? JSON.parse(createdJob.detailed_analysis) : null,
      emailed: Boolean(createdJob.emailed)
    };

    res.status(201).json(processedJob);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Update job
router.put('/:id', (req, res) => {
  try {
    const updates: JobUpdate = req.body;
    const id = req.params.id;
    const now = new Date().toISOString();

    // Build dynamic update query
    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at');
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const values = fields.map(field => {
      const value = updates[field as keyof JobUpdate];
      if (field === 'top_matches' || field === 'detailed_analysis') {
        return value ? JSON.stringify(value) : null;
      }
      if (field === 'emailed') {
        return value ? 1 : 0;
      }
      return value;
    });

    const stmt = db.prepare(`
      UPDATE jobs 
      SET ${setClause}, updated_at = ?
      WHERE id = ?
    `);

    const result = stmt.run(...values, now, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Fetch the updated job
    const updatedJob = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) as JobRow;
    const processedJob = {
      ...updatedJob,
      top_matches: updatedJob.top_matches ? JSON.parse(updatedJob.top_matches) : null,
      detailed_analysis: updatedJob.detailed_analysis ? JSON.parse(updatedJob.detailed_analysis) : null,
      emailed: Boolean(updatedJob.emailed)
    };

    res.json(processedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Delete job
router.delete('/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM jobs WHERE id = ?');
    const result = stmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// Get job status counts
router.get('/stats/status-counts', (req, res) => {
  try {
    const stmt = db.prepare('SELECT status, COUNT(*) as count FROM jobs GROUP BY status');
    const results = stmt.all() as { status: string; count: number }[];
    
    const counts = results.reduce((acc: Record<string, number>, row: { status: string; count: number }) => {
      acc[row.status] = row.count;
      return acc;
    }, {});

    res.json(counts);
  } catch (error) {
    console.error('Error fetching status counts:', error);
    res.status(500).json({ error: 'Failed to fetch status counts' });
  }
});

export default router;