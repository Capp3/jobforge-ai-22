// Simple Express Server for JobForge AI
import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './database.js';
import jobsRouter from './routes/jobs.js';
import preferencesRouter from './routes/preferences.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase();

// Routes
app.use('/api/jobs', jobsRouter);
app.use('/api/preferences', preferencesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'JobForge API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 JobForge API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

export default app;