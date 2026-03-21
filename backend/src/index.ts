import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import workoutRoutes from './routes/workouts';
import nutritionRoutes from './routes/nutrition';
import healthRoutes from './routes/health';
import aiRoutes from './routes/ai';
import foodRoutes from './routes/foods';
import smartwatchRoutes from './routes/smartwatch';

const app: Express = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hira';
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/smartwatch', smartwatchRoutes);

// ── Top-level convenience endpoints (proxy to AI engine) ─────────────────────

// POST /api/generate-plan
app.post('/api/generate-plan', async (req: Request, res: Response) => {
  try {
    const aiRes = await axios.post(`${AI_ENGINE_URL}/generate-plan`, req.body, { timeout: 10000 });
    res.json(aiRes.data);
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'AI engine unavailable', fallback: true });
  }
});

// POST /api/meal-suggestion
app.post('/api/meal-suggestion', async (req: Request, res: Response) => {
  try {
    const aiRes = await axios.post(`${AI_ENGINE_URL}/meal-suggestions`, req.body, { timeout: 10000 });
    res.json(aiRes.data);
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'AI engine unavailable', fallback: true });
  }
});

// POST /api/adjust-plan
app.post('/api/adjust-plan', async (req: Request, res: Response) => {
  try {
    const aiRes = await axios.post(`${AI_ENGINE_URL}/adjust-plan`, req.body, { timeout: 10000 });
    res.json(aiRes.data);
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'AI engine unavailable', fallback: true });
  }
});

// ─────────────────────────────────────────────────────────────────────────────

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HIRA Backend server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
