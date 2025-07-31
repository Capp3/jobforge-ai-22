// LLM Integration API Routes
import { Router } from 'express';
import { db, generateId } from '../database.js';
import type { 
  LLMConfiguration,
  OllamaModel,
  BasicFilterResult,
  DetailedAnalysisResult 
} from '../../src/services/llmIntegrationService.js';

const router = Router();

// ========================================
// LLM CONFIGURATION ENDPOINTS
// ========================================

// Save LLM configuration
router.post('/llm-config', (req, res) => {
  try {
    const config: LLMConfiguration = req.body;
    
    if (!config || !config.llm1 || !config.llm2) {
      return res.status(400).json({ error: 'Invalid LLM configuration' });
    }

    const id = generateId();
    const configJson = JSON.stringify(config);
    const now = new Date().toISOString();

    // Delete existing configuration
    db.prepare('DELETE FROM llm_configurations WHERE active = 1').run();

    // Insert new configuration
    const stmt = db.prepare(`
      INSERT INTO llm_configurations (id, config_data, active, created_at, updated_at)
      VALUES (?, ?, 1, ?, ?)
    `);
    
    stmt.run(id, configJson, now, now);
    
    res.json({ success: true, id });
  } catch (error) {
    console.error('Error saving LLM configuration:', error);
    res.status(500).json({ error: 'Failed to save LLM configuration' });
  }
});

// Load LLM configuration
router.get('/llm-config', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM llm_configurations WHERE active = 1 ORDER BY created_at DESC LIMIT 1');
    const result = stmt.get();
    
    if (!result) {
      return res.json(null);
    }

    const config = JSON.parse((result as any).config_data);
    res.json(config);
  } catch (error) {
    console.error('Error loading LLM configuration:', error);
    res.status(500).json({ error: 'Failed to load LLM configuration' });
  }
});

// ========================================
// OLLAMA MODEL DETECTION
// ========================================

// Get available Ollama models
router.get('/ollama/models', async (req, res) => {
  try {
    const endpoint = (req.query.endpoint as string) || 'http://localhost:11434';
    
    const response = await fetch(`${endpoint}/api/tags`);
    
    if (!response.ok) {
      return res.status(503).json({ 
        error: 'Ollama not available',
        endpoint,
        models: []
      });
    }
    
    const data = await response.json();
    const models: OllamaModel[] = data.models || [];
    
    res.json({
      endpoint,
      available: true,
      models: models.map(model => ({
        name: model.name,
        size: model.size,
        modified_at: model.modified_at,
        digest: model.digest
      }))
    });
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    res.status(503).json({ 
      error: 'Failed to connect to Ollama',
      endpoint: req.query.endpoint || 'http://localhost:11434',
      models: []
    });
  }
});

// Test Ollama connection
router.post('/ollama/test', async (req, res) => {
  try {
    const { endpoint, model } = req.body;
    
    if (!endpoint || !model) {
      return res.status(400).json({ error: 'Endpoint and model are required' });
    }

    const response = await fetch(`${endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: 'Hello, test connection',
        stream: false
      })
    });
    
    const success = response.ok;
    let responseData = null;
    
    if (success) {
      responseData = await response.json();
    }
    
    res.json({
      success,
      endpoint,
      model,
      status: response.status,
      statusText: response.statusText,
      response: success ? responseData?.response?.substring(0, 100) : null
    });
  } catch (error) {
    console.error('Ollama connection test failed:', error);
    res.json({
      success: false,
      endpoint: req.body.endpoint,
      model: req.body.model,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ========================================
// PROVIDER CONNECTION TESTING
// ========================================

// Test OpenAI connection
router.post('/providers/openai/test', async (req, res) => {
  try {
    const { apiKey, model } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    const success = response.ok;
    
    res.json({
      success,
      provider: 'openai',
      model,
      status: response.status,
      statusText: response.statusText
    });
  } catch (error) {
    res.json({
      success: false,
      provider: 'openai',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test Anthropic connection
router.post('/providers/anthropic/test', async (req, res) => {
  try {
    const { apiKey, model } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }]
      })
    });
    
    const success = response.status !== 401; // Unauthorized means invalid key
    
    res.json({
      success,
      provider: 'anthropic',
      model,
      status: response.status,
      statusText: response.statusText
    });
  } catch (error) {
    res.json({
      success: false,
      provider: 'anthropic',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test Gemini connection
router.post('/providers/gemini/test', async (req, res) => {
  try {
    const { apiKey, model } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    
    const success = response.ok;
    
    res.json({
      success,
      provider: 'gemini',
      model,
      status: response.status,
      statusText: response.statusText
    });
  } catch (error) {
    res.json({
      success: false,
      provider: 'gemini',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test Grok connection
router.post('/providers/grok/test', async (req, res) => {
  try {
    const { apiKey, model } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const response = await fetch('https://api.x.ai/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    const success = response.ok;
    
    res.json({
      success,
      provider: 'grok',
      model,
      status: response.status,
      statusText: response.statusText
    });
  } catch (error) {
    res.json({
      success: false,
      provider: 'grok',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ========================================
// JOB ANALYSIS ENDPOINTS
// ========================================

// Analyze job with basic filtering
router.post('/analyze/basic', async (req, res) => {
  try {
    const { job_id, analysis_result } = req.body;
    
    if (!job_id || !analysis_result) {
      return res.status(400).json({ error: 'job_id and analysis_result are required' });
    }

    const result: BasicFilterResult = analysis_result;
    const id = generateId();
    const now = new Date().toISOString();

    // Store basic analysis result
    const stmt = db.prepare(`
      INSERT INTO llm_analysis_basic (
        id, job_id, rating, reasoning, processing_time_ms, 
        model_used, provider, cost_estimate, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id, job_id, result.rating, result.reasoning, result.processing_time_ms,
      result.model_used, result.provider, result.cost_estimate || 0, now
    );

    // Update job with analysis result
    const updateJobStmt = db.prepare(`
      UPDATE jobs 
      SET ai_rating = ?, ai_notes = ?, status = ?, updated_at = ?
      WHERE id = ?
    `);
    
    // Convert rating to numeric scale for storage
    const numericRating = result.rating === 'APPROVE' ? 8 : result.rating === 'MAYBE' ? 5 : 2;
    const newStatus = result.rating === 'APPROVE' ? 'approved' : 
                     result.rating === 'MAYBE' ? 'needs_review' : 'filtered_out';
    
    updateJobStmt.run(numericRating, result.reasoning, newStatus, now, job_id);
    
    res.json({ success: true, analysis_id: id, job_status: newStatus });
  } catch (error) {
    console.error('Error storing basic analysis:', error);
    res.status(500).json({ error: 'Failed to store basic analysis result' });
  }
});

// Analyze job with detailed analysis
router.post('/analyze/detailed', async (req, res) => {
  try {
    const { job_id, analysis_result } = req.body;
    
    if (!job_id || !analysis_result) {
      return res.status(400).json({ error: 'job_id and analysis_result are required' });
    }

    const result: DetailedAnalysisResult = analysis_result;
    const id = generateId();
    const now = new Date().toISOString();
    const analysisJson = JSON.stringify(result.analysis);

    // Store detailed analysis result
    const stmt = db.prepare(`
      INSERT INTO llm_analysis_detailed (
        id, job_id, analysis_data, processing_time_ms, 
        model_used, provider, cost_estimate, confidence_score, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id, job_id, analysisJson, result.processing_time_ms,
      result.model_used, result.provider, result.cost_estimate || 0, 
      result.confidence_score || 0, now
    );

    // Update job with detailed analysis
    const updateJobStmt = db.prepare(`
      UPDATE jobs 
      SET detailed_analysis = ?, updated_at = ?
      WHERE id = ?
    `);
    
    updateJobStmt.run(analysisJson, now, job_id);
    
    res.json({ success: true, analysis_id: id });
  } catch (error) {
    console.error('Error storing detailed analysis:', error);
    res.status(500).json({ error: 'Failed to store detailed analysis result' });
  }
});

// Get analysis results for a job
router.get('/analyze/:job_id', (req, res) => {
  try {
    const { job_id } = req.params;
    
    // Get basic analysis
    const basicStmt = db.prepare(`
      SELECT * FROM llm_analysis_basic 
      WHERE job_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    const basicResult = basicStmt.get(job_id);
    
    // Get detailed analysis
    const detailedStmt = db.prepare(`
      SELECT * FROM llm_analysis_detailed 
      WHERE job_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    const detailedResult = detailedStmt.get(job_id);
    
    const response: any = {
      job_id,
      basic_analysis: basicResult || null,
      detailed_analysis: detailedResult ? {
        ...(detailedResult as any),
        analysis_data: JSON.parse((detailedResult as any).analysis_data)
      } : null
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching analysis results:', error);
    res.status(500).json({ error: 'Failed to fetch analysis results' });
  }
});

// Get LLM usage statistics
router.get('/stats', (req, res) => {
  try {
    // Basic analysis stats
    const basicStatsStmt = db.prepare(`
      SELECT 
        provider,
        model_used,
        COUNT(*) as count,
        AVG(processing_time_ms) as avg_processing_time,
        SUM(cost_estimate) as total_cost,
        rating
      FROM llm_analysis_basic 
      WHERE created_at >= date('now', '-30 days')
      GROUP BY provider, model_used, rating
    `);
    const basicStats = basicStatsStmt.all();
    
    // Detailed analysis stats
    const detailedStatsStmt = db.prepare(`
      SELECT 
        provider,
        model_used,
        COUNT(*) as count,
        AVG(processing_time_ms) as avg_processing_time,
        AVG(confidence_score) as avg_confidence,
        SUM(cost_estimate) as total_cost
      FROM llm_analysis_detailed 
      WHERE created_at >= date('now', '-30 days')
      GROUP BY provider, model_used
    `);
    const detailedStats = detailedStatsStmt.all();
    
    // Daily usage
    const dailyUsageStmt = db.prepare(`
      SELECT 
        date(created_at) as date,
        COUNT(*) as analyses,
        SUM(cost_estimate) as daily_cost
      FROM (
        SELECT created_at, cost_estimate FROM llm_analysis_basic
        WHERE created_at >= date('now', '-30 days')
        UNION ALL
        SELECT created_at, cost_estimate FROM llm_analysis_detailed
        WHERE created_at >= date('now', '-30 days')
      )
      GROUP BY date(created_at)
      ORDER BY date(created_at)
    `);
    const dailyUsage = dailyUsageStmt.all();
    
    const basicCost = (basicStats as any[]).reduce((sum: number, stat: any) => sum + (Number(stat.total_cost) || 0), 0);
    const detailedCost = (detailedStats as any[]).reduce((sum: number, stat: any) => sum + (Number(stat.total_cost) || 0), 0);
    
    res.json({
      basic_analysis: basicStats,
      detailed_analysis: detailedStats,
      daily_usage: dailyUsage,
      total_cost_30_days: basicCost + detailedCost
    });
  } catch (error) {
    console.error('Error fetching LLM stats:', error);
    res.status(500).json({ error: 'Failed to fetch LLM usage statistics' });
  }
});

export default router; 