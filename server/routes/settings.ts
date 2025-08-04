// Settings API Routes
// Handles SMTP configuration and notification preferences
import { Router } from 'express';
import { db, generateId } from '../database.js';

const router = Router();

// SMTP Configuration
interface SMTPConfig {
  id: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  from: string;
  created_at: string;
  updated_at: string;
}

// Notification Preferences
interface NotificationPreferences {
  id: string;
  email_enabled: boolean;
  email_frequency: 'immediate' | 'daily' | 'weekly';
  email_types: string; // JSON array of notification types
  digest_time: string; // HH:MM format
  created_at: string;
  updated_at: string;
}

// AI Prompts
interface AIPrompts {
  id: string;
  prompt1: string; // Initial filtering prompt
  prompt2: string; // Detailed analysis prompt
  created_at: string;
  updated_at: string;
}

// Create settings tables if they don't exist
const initializeSettingsTables = () => {
  try {
    // SMTP Configuration table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS smtp_config (
        id TEXT PRIMARY KEY,
        host TEXT NOT NULL,
        port INTEGER NOT NULL DEFAULT 587,
        secure INTEGER NOT NULL DEFAULT 0,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        from_email TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `).run();

    // Notification Preferences table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id TEXT PRIMARY KEY,
        email_enabled INTEGER NOT NULL DEFAULT 1,
        email_frequency TEXT NOT NULL DEFAULT 'daily',
        email_types TEXT NOT NULL DEFAULT '["new_jobs", "status_changes", "weekly_digest"]',
        digest_time TEXT NOT NULL DEFAULT '09:00',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `).run();

    // AI Prompts table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS ai_prompts (
        id TEXT PRIMARY KEY,
        prompt1 TEXT NOT NULL,
        prompt2 TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `).run();

    console.log('Settings tables initialized successfully');
  } catch (error) {
    console.error('Error initializing settings tables:', error);
  }
};

// Initialize tables on module load
initializeSettingsTables();

// === SMTP Configuration Routes ===

// Get SMTP configuration
router.get('/smtp', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM smtp_config ORDER BY created_at DESC LIMIT 1');
    const config = stmt.get() as SMTPConfig | undefined;
    
    if (!config) {
      return res.json({
        host: '',
        port: 587,
        secure: false,
        username: '',
        password: '',
        from: ''
      });
    }

    // Convert secure from INTEGER to boolean and exclude sensitive data in response
    res.json({
      id: config.id,
      host: config.host,
      port: config.port,
      secure: Boolean(config.secure),
      username: config.username,
      from: config.from,
      // Don't return password in response
      created_at: config.created_at,
      updated_at: config.updated_at
    });
  } catch (error) {
    console.error('Error fetching SMTP config:', error);
    res.status(500).json({ error: 'Failed to fetch SMTP configuration' });
  }
});

// Create or update SMTP configuration
router.post('/smtp', (req, res) => {
  try {
    const { host, port = 587, secure = false, username, password, from } = req.body;

    // Validate required fields
    if (!host || !username || !password || !from) {
      return res.status(400).json({ error: 'Missing required SMTP configuration fields' });
    }

    const now = new Date().toISOString();
    
    // Check if config exists
    const existingStmt = db.prepare('SELECT id FROM smtp_config ORDER BY created_at DESC LIMIT 1');
    const existing = existingStmt.get() as { id: string } | undefined;

    if (existing) {
      // Update existing
      const updateStmt = db.prepare(`
        UPDATE smtp_config 
        SET host = ?, port = ?, secure = ?, username = ?, password = ?, from_email = ?, updated_at = ?
        WHERE id = ?
      `);
      updateStmt.run(host, port, secure ? 1 : 0, username, password, from, now, existing.id);
      
      res.json({ message: 'SMTP configuration updated successfully' });
    } else {
      // Create new
      const id = generateId();
      const insertStmt = db.prepare(`
        INSERT INTO smtp_config (id, host, port, secure, username, password, from_email, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertStmt.run(id, host, port, secure ? 1 : 0, username, password, from, now, now);
      
      res.json({ message: 'SMTP configuration created successfully' });
    }
  } catch (error) {
    console.error('Error saving SMTP config:', error);
    res.status(500).json({ error: 'Failed to save SMTP configuration' });
  }
});

// Test SMTP connection
router.post('/smtp/test', async (req, res) => {
  try {
    const { host, port, secure, username, password } = req.body;
    
    // Import nodemailer dynamically
    const nodemailer = await import('nodemailer');
    
    const transporter = nodemailer.default.createTransporter({
      host,
      port,
      secure,
      auth: {
        user: username,
        pass: password,
      },
    });

    // Verify connection
    await transporter.verify();
    
    res.json({ success: true, message: 'SMTP connection successful' });
  } catch (error) {
    console.error('SMTP test failed:', error);
    res.status(400).json({ 
      success: false, 
      message: 'SMTP connection failed',
      error: error.message 
    });
  }
});

// === Notification Preferences Routes ===

// Get notification preferences
router.get('/notifications', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM notification_preferences ORDER BY created_at DESC LIMIT 1');
    const preferences = stmt.get() as NotificationPreferences | undefined;
    
    if (!preferences) {
      return res.json({
        email_enabled: true,
        email_frequency: 'daily',
        email_types: ['new_jobs', 'status_changes', 'weekly_digest'],
        digest_time: '09:00'
      });
    }

    // Parse JSON fields and convert booleans
    res.json({
      id: preferences.id,
      email_enabled: Boolean(preferences.email_enabled),
      email_frequency: preferences.email_frequency,
      email_types: JSON.parse(preferences.email_types),
      digest_time: preferences.digest_time,
      created_at: preferences.created_at,
      updated_at: preferences.updated_at
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
});

// Create or update notification preferences
router.post('/notifications', (req, res) => {
  try {
    const { 
      email_enabled = true, 
      email_frequency = 'daily', 
      email_types = ['new_jobs', 'status_changes', 'weekly_digest'],
      digest_time = '09:00'
    } = req.body;

    // Validate email_frequency
    if (!['immediate', 'daily', 'weekly'].includes(email_frequency)) {
      return res.status(400).json({ error: 'Invalid email frequency' });
    }

    // Validate digest_time format (HH:MM)
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(digest_time)) {
      return res.status(400).json({ error: 'Invalid digest time format. Use HH:MM' });
    }

    const now = new Date().toISOString();
    
    // Check if preferences exist
    const existingStmt = db.prepare('SELECT id FROM notification_preferences ORDER BY created_at DESC LIMIT 1');
    const existing = existingStmt.get() as { id: string } | undefined;

    if (existing) {
      // Update existing
      const updateStmt = db.prepare(`
        UPDATE notification_preferences 
        SET email_enabled = ?, email_frequency = ?, email_types = ?, digest_time = ?, updated_at = ?
        WHERE id = ?
      `);
      updateStmt.run(
        email_enabled ? 1 : 0, 
        email_frequency, 
        JSON.stringify(email_types), 
        digest_time, 
        now, 
        existing.id
      );
      
      res.json({ message: 'Notification preferences updated successfully' });
    } else {
      // Create new
      const id = generateId();
      const insertStmt = db.prepare(`
        INSERT INTO notification_preferences (id, email_enabled, email_frequency, email_types, digest_time, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertStmt.run(
        id, 
        email_enabled ? 1 : 0, 
        email_frequency, 
        JSON.stringify(email_types), 
        digest_time, 
        now, 
        now
      );
      
      res.json({ message: 'Notification preferences created successfully' });
    }
  } catch (error) {
    console.error('Error saving notification preferences:', error);
    res.status(500).json({ error: 'Failed to save notification preferences' });
  }
});

// === AI Prompts Routes ===

// Get AI prompts
router.get('/prompts', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM ai_prompts ORDER BY created_at DESC LIMIT 1');
    const prompts = stmt.get() as AIPrompts | undefined;
    
    if (!prompts) {
      return res.json({
        prompt1: `You are a job filtering assistant. Review this job listing against the candidate's profile.

CANDIDATE PROFILE:
{{biography}}

JOB LISTING:
Title: {{job_title}}
Company: {{company}}
Location: {{location}}
Description: {{job_description}}

Rate as: REJECT, MAYBE, or APPROVE`,
        prompt2: `Provide detailed analysis of this job opportunity:

JOB DETAILS:
{{job_title}} at {{company}}
Location: {{location}}
Description: {{job_description}}

Analyze:
1. Technical challenges
2. Career growth potential
3. Company assessment
4. Application strategy`
      });
    }

    res.json({
      id: prompts.id,
      prompt1: prompts.prompt1,
      prompt2: prompts.prompt2,
      created_at: prompts.created_at,
      updated_at: prompts.updated_at
    });
  } catch (error) {
    console.error('Error fetching AI prompts:', error);
    res.status(500).json({ error: 'Failed to fetch AI prompts' });
  }
});

// Create or update AI prompts
router.post('/prompts', (req, res) => {
  try {
    const { prompt1, prompt2 } = req.body;

    // Validate required fields
    if (!prompt1 || !prompt2) {
      return res.status(400).json({ error: 'Both prompt1 and prompt2 are required' });
    }

    const now = new Date().toISOString();
    
    // Check if prompts exist
    const existingStmt = db.prepare('SELECT id FROM ai_prompts ORDER BY created_at DESC LIMIT 1');
    const existing = existingStmt.get() as { id: string } | undefined;

    if (existing) {
      // Update existing
      const updateStmt = db.prepare(`
        UPDATE ai_prompts 
        SET prompt1 = ?, prompt2 = ?, updated_at = ?
        WHERE id = ?
      `);
      updateStmt.run(prompt1, prompt2, now, existing.id);
      
      res.json({ message: 'AI prompts updated successfully' });
    } else {
      // Create new
      const id = generateId();
      const insertStmt = db.prepare(`
        INSERT INTO ai_prompts (id, prompt1, prompt2, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertStmt.run(id, prompt1, prompt2, now, now);
      
      res.json({ message: 'AI prompts created successfully' });
    }
  } catch (error) {
    console.error('Error saving AI prompts:', error);
    res.status(500).json({ error: 'Failed to save AI prompts' });
  }
});

export default router;