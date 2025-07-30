// Preferences API Routes
import { Router } from 'express';
import { db, generateId } from '../database.js';
import type { UserPreferences, PreferencesCreate, PreferencesUpdate } from '../../src/types/algorithm.js';

const router = Router();

// Get user preferences (simplified for single-user)
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM preferences ORDER BY created_at DESC LIMIT 1');
    const preferences = stmt.get();
    
    if (!preferences) {
      return res.status(404).json({ error: 'No preferences found' });
    }

    // Parse JSON fields
    const processedPreferences = {
      ...preferences,
      preferred_locations: JSON.parse(preferences.preferred_locations),
      work_mode: JSON.parse(preferences.work_mode),
      career_level: JSON.parse(preferences.career_level),
      tech_stack: JSON.parse(preferences.tech_stack),
      company_size: JSON.parse(preferences.company_size)
    };

    res.json(processedPreferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Create new preferences
router.post('/', (req, res) => {
  try {
    const preferencesData: PreferencesCreate = req.body;
    const id = generateId();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO preferences (
        id, preferred_locations, work_mode, travel_willingness, salary_range,
        career_level, tech_stack, company_size, ollama_endpoint, ollama_model,
        advanced_ai_model, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      id,
      JSON.stringify(preferencesData.preferred_locations),
      JSON.stringify(preferencesData.work_mode),
      preferencesData.travel_willingness,
      preferencesData.salary_range,
      JSON.stringify(preferencesData.career_level),
      JSON.stringify(preferencesData.tech_stack),
      JSON.stringify(preferencesData.company_size),
      preferencesData.ollama_endpoint || null,
      preferencesData.ollama_model || null,
      preferencesData.advanced_ai_model || null,
      now,
      now
    );

    // Fetch the created preferences
    const createdPreferences = db.prepare('SELECT * FROM preferences WHERE id = ?').get(id);
    const processedPreferences = {
      ...createdPreferences,
      preferred_locations: JSON.parse(createdPreferences.preferred_locations),
      work_mode: JSON.parse(createdPreferences.work_mode),
      career_level: JSON.parse(createdPreferences.career_level),
      tech_stack: JSON.parse(createdPreferences.tech_stack),
      company_size: JSON.parse(createdPreferences.company_size)
    };

    res.status(201).json(processedPreferences);
  } catch (error) {
    console.error('Error creating preferences:', error);
    res.status(500).json({ error: 'Failed to create preferences' });
  }
});

// Update preferences
router.put('/:id', (req, res) => {
  try {
    const updates: PreferencesUpdate = req.body;
    const id = req.params.id;
    const now = new Date().toISOString();

    // Build dynamic update query
    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at');
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const values = fields.map(field => {
      const value = updates[field as keyof PreferencesUpdate];
      if (Array.isArray(value)) {
        return JSON.stringify(value);
      }
      return value;
    });

    const stmt = db.prepare(`
      UPDATE preferences 
      SET ${setClause}, updated_at = ?
      WHERE id = ?
    `);

    const result = stmt.run(...values, now, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Preferences not found' });
    }

    // Fetch the updated preferences
    const updatedPreferences = db.prepare('SELECT * FROM preferences WHERE id = ?').get(id);
    const processedPreferences = {
      ...updatedPreferences,
      preferred_locations: JSON.parse(updatedPreferences.preferred_locations),
      work_mode: JSON.parse(updatedPreferences.work_mode),
      career_level: JSON.parse(updatedPreferences.career_level),
      tech_stack: JSON.parse(updatedPreferences.tech_stack),
      company_size: JSON.parse(updatedPreferences.company_size)
    };

    res.json(processedPreferences);
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Get or create default preferences
router.post('/defaults', (req, res) => {
  try {
    // Check if preferences exist
    const existingStmt = db.prepare('SELECT * FROM preferences ORDER BY created_at DESC LIMIT 1');
    let preferences = existingStmt.get();
    
    if (!preferences) {
      // Create default preferences
      const id = generateId();
      const now = new Date().toISOString();
      
      const defaultPreferences = {
        preferred_locations: ['Belfast', 'Northern Ireland', 'UK', 'Remote'],
        work_mode: ['hybrid', 'remote', 'onsite'],
        travel_willingness: 'limited',
        salary_range: '40000-80000',
        career_level: ['senior', 'mid'],
        tech_stack: ['broadcast', 'media', 'production', 'networking', 'AV', 'IP'],
        company_size: ['startup', 'medium', 'large']
      };

      const createStmt = db.prepare(`
        INSERT INTO preferences (
          id, preferred_locations, work_mode, travel_willingness, salary_range,
          career_level, tech_stack, company_size, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      createStmt.run(
        id,
        JSON.stringify(defaultPreferences.preferred_locations),
        JSON.stringify(defaultPreferences.work_mode),
        defaultPreferences.travel_willingness,
        defaultPreferences.salary_range,
        JSON.stringify(defaultPreferences.career_level),
        JSON.stringify(defaultPreferences.tech_stack),
        JSON.stringify(defaultPreferences.company_size),
        now,
        now
      );

      preferences = db.prepare('SELECT * FROM preferences WHERE id = ?').get(id);
    }

    // Parse JSON fields
    const processedPreferences = {
      ...preferences,
      preferred_locations: JSON.parse(preferences.preferred_locations),
      work_mode: JSON.parse(preferences.work_mode),
      career_level: JSON.parse(preferences.career_level),
      tech_stack: JSON.parse(preferences.tech_stack),
      company_size: JSON.parse(preferences.company_size)
    };

    res.json(processedPreferences);
  } catch (error) {
    console.error('Error getting/creating default preferences:', error);
    res.status(500).json({ error: 'Failed to get or create default preferences' });
  }
});

export default router;