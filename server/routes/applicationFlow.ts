// Application Flow API Routes
import { Router } from 'express';
import { db, generateId } from '../database.js';
import type { 
  ApplicationFlowEvent, 
  FollowUpAction, 
  Interview,
  ApplicationEventType 
} from '../../src/services/applicationFlowService.js';

const router = Router();

// ========================================
// APPLICATION EVENTS ENDPOINTS
// ========================================

// Create application event
router.post('/events', (req, res) => {
  try {
    const { job_id, event_type, scheduled_date, notes } = req.body;
    
    if (!job_id || !event_type) {
      return res.status(400).json({ error: 'job_id and event_type are required' });
    }

    const id = generateId();
    const event = {
      id,
      job_id,
      event_type,
      scheduled_date: scheduled_date || null,
      notes: notes || null,
      created_at: new Date().toISOString()
    };

    const stmt = db.prepare(`
      INSERT INTO application_events (id, job_id, event_type, scheduled_date, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, job_id, event_type, scheduled_date, notes, event.created_at);
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating application event:', error);
    res.status(500).json({ error: 'Failed to create application event' });
  }
});

// Get events for a specific job
router.get('/events', (req, res) => {
  try {
    const { job_id } = req.query;
    
    if (!job_id) {
      return res.status(400).json({ error: 'job_id parameter is required' });
    }

    const stmt = db.prepare('SELECT * FROM application_events WHERE job_id = ? ORDER BY created_at DESC');
    const events = stmt.all(job_id as string);
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching application events:', error);
    res.status(500).json({ error: 'Failed to fetch application events' });
  }
});

// ========================================
// FOLLOW-UP ACTIONS ENDPOINTS
// ========================================

// Create follow-up action
router.post('/follow-ups', (req, res) => {
  try {
    const { job_id, action_type, due_date, notes } = req.body;
    
    if (!job_id || !action_type || !due_date) {
      return res.status(400).json({ error: 'job_id, action_type, and due_date are required' });
    }

    const id = generateId();
    const followUp = {
      id,
      job_id,
      action_type,
      due_date,
      completed: false,
      notes: notes || null,
      created_at: new Date().toISOString()
    };

    const stmt = db.prepare(`
      INSERT INTO follow_up_actions (id, job_id, action_type, due_date, completed, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, job_id, action_type, due_date, 0, notes, followUp.created_at);
    
    res.status(201).json(followUp);
  } catch (error) {
    console.error('Error creating follow-up action:', error);
    res.status(500).json({ error: 'Failed to create follow-up action' });
  }
});

// Get follow-ups for a specific job
router.get('/follow-ups', (req, res) => {
  try {
    const { job_id } = req.query;
    
    if (!job_id) {
      return res.status(400).json({ error: 'job_id parameter is required' });
    }

    const stmt = db.prepare('SELECT * FROM follow_up_actions WHERE job_id = ? ORDER BY due_date ASC');
    const followUps = stmt.all(job_id as string).map((row: any) => ({
      ...row,
      completed: Boolean(row.completed)
    }));
    
    res.json(followUps);
  } catch (error) {
    console.error('Error fetching follow-up actions:', error);
    res.status(500).json({ error: 'Failed to fetch follow-up actions' });
  }
});

// Update follow-up action
router.put('/follow-ups/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { completed, notes, completed_date } = req.body;

    const stmt = db.prepare(`
      UPDATE follow_up_actions 
      SET completed = ?, notes = ?, completed_date = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(
      completed ? 1 : 0, 
      notes || null, 
      completed_date || null, 
      id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Follow-up action not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating follow-up action:', error);
    res.status(500).json({ error: 'Failed to update follow-up action' });
  }
});

// ========================================
// INTERVIEWS ENDPOINTS
// ========================================

// Create interview
router.post('/interviews', (req, res) => {
  try {
    const {
      job_id,
      interview_type,
      scheduled_date,
      duration_minutes,
      interviewer_name,
      interviewer_email,
      location,
      meeting_link,
      preparation_notes
    } = req.body;
    
    if (!job_id || !interview_type || !scheduled_date) {
      return res.status(400).json({ error: 'job_id, interview_type, and scheduled_date are required' });
    }

    const id = generateId();
    const now = new Date().toISOString();
    
    const interview = {
      id,
      job_id,
      interview_type,
      scheduled_date,
      duration_minutes: duration_minutes || null,
      interviewer_name: interviewer_name || null,
      interviewer_email: interviewer_email || null,
      location: location || null,
      meeting_link: meeting_link || null,
      preparation_notes: preparation_notes || null,
      outcome: 'scheduled',
      created_at: now,
      updated_at: now
    };

    const stmt = db.prepare(`
      INSERT INTO interviews (
        id, job_id, interview_type, scheduled_date, duration_minutes,
        interviewer_name, interviewer_email, location, meeting_link,
        preparation_notes, outcome, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id, job_id, interview_type, scheduled_date, duration_minutes,
      interviewer_name, interviewer_email, location, meeting_link,
      preparation_notes, 'scheduled', now, now
    );
    
    res.status(201).json(interview);
  } catch (error) {
    console.error('Error creating interview:', error);
    res.status(500).json({ error: 'Failed to create interview' });
  }
});

// Get interviews for a specific job
router.get('/interviews', (req, res) => {
  try {
    const { job_id } = req.query;
    
    if (!job_id) {
      return res.status(400).json({ error: 'job_id parameter is required' });
    }

    const stmt = db.prepare('SELECT * FROM interviews WHERE job_id = ? ORDER BY scheduled_date ASC');
    const interviews = stmt.all(job_id as string);
    
    res.json(interviews);
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
});

// Update interview
router.put('/interviews/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      feedback_notes,
      outcome,
      next_steps,
      ...otherFields
    } = req.body;

    // Build dynamic update query
    const fields: string[] = [];
    const values: any[] = [];
    
    if (feedback_notes !== undefined) {
      fields.push('feedback_notes = ?');
      values.push(feedback_notes);
    }
    if (outcome !== undefined) {
      fields.push('outcome = ?');
      values.push(outcome);
    }
    if (next_steps !== undefined) {
      fields.push('next_steps = ?');
      values.push(next_steps);
    }
    
    // Add other updatable fields
    Object.entries(otherFields).forEach(([key, value]) => {
      if (['interviewer_name', 'interviewer_email', 'location', 'meeting_link', 'preparation_notes'].includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = db.prepare(`UPDATE interviews SET ${fields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating interview:', error);
    res.status(500).json({ error: 'Failed to update interview' });
  }
});

// ========================================
// DASHBOARD DATA ENDPOINT
// ========================================

// Get dashboard data aggregation
router.get('/dashboard', (req, res) => {
  try {
    // Get upcoming interviews (next 30 days)
    const upcomingInterviewsStmt = db.prepare(`
      SELECT i.*, j.title, j.company 
      FROM interviews i
      JOIN jobs j ON i.job_id = j.id
      WHERE i.scheduled_date >= ? AND i.scheduled_date <= ?
      AND i.outcome = 'scheduled'
      ORDER BY i.scheduled_date ASC
      LIMIT 10
    `);
    
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    const upcoming_interviews = upcomingInterviewsStmt.all(
      now.toISOString(),
      thirtyDaysFromNow.toISOString()
    );

    // Get pending follow-ups (overdue and due soon)
    const pendingFollowUpsStmt = db.prepare(`
      SELECT f.*, j.title, j.company 
      FROM follow_up_actions f
      JOIN jobs j ON f.job_id = j.id
      WHERE f.completed = 0 AND f.due_date <= ?
      ORDER BY f.due_date ASC
      LIMIT 10
    `);
    
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);
    
    const pending_follow_ups = pendingFollowUpsStmt.all(sevenDaysFromNow.toISOString())
      .map((row: any) => ({ ...row, completed: Boolean(row.completed) }));

    // Get recent events (last 7 days)
    const recentEventsStmt = db.prepare(`
      SELECT e.*, j.title, j.company 
      FROM application_events e
      JOIN jobs j ON e.job_id = j.id
      WHERE e.created_at >= ?
      ORDER BY e.created_at DESC
      LIMIT 20
    `);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    
    const recent_events = recentEventsStmt.all(sevenDaysAgo.toISOString());

    // Get job statistics
    const totalJobsStmt = db.prepare('SELECT COUNT(*) as count FROM jobs');
    const total = (totalJobsStmt.get() as any).count;

    const jobsByStatusStmt = db.prepare('SELECT status, COUNT(*) as count FROM jobs GROUP BY status');
    const statusCounts = jobsByStatusStmt.all();
    const by_status = statusCounts.reduce((acc: any, row: any) => {
      acc[row.status] = row.count;
      return acc;
    }, {});

    const thisWeekJobsStmt = db.prepare(`
      SELECT COUNT(*) as count 
      FROM jobs 
      WHERE created_at >= ?
    `);
    const thisWeekStart = new Date();
    thisWeekStart.setDate(now.getDate() - 7);
    const this_week = (thisWeekJobsStmt.get(thisWeekStart.toISOString()) as any).count;

    const dashboardData = {
      upcoming_interviews,
      pending_follow_ups,
      recent_events,
      job_stats: {
        total,
        by_status,
        this_week
      }
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router; 