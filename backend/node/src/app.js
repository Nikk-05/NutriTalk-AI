import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';

import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import mealRoutes from './routes/meals.routes.js';
import dietPlanRoutes from './routes/dietPlans.routes.js';
import recipeRoutes from './routes/recipes.routes.js';
import notificationRoutes from './routes/notifications.routes.js';
import subscriptionRoutes from './routes/subscriptions.routes.js';

const app = express();

// ── Connect to MongoDB ─────────────────────────────────────
connectDB();

// ── Security & Middleware ──────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ── Global Rate Limiter ────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many requests, please try again later.' } },
});
app.use(globalLimiter);

// ── Health Check ───────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'nutritalk-node-api', timestamp: new Date().toISOString() });
});

// ── Node.js Routes (non-AI) ───────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/dashboard',     dashboardRoutes);
app.use('/api/meals',         mealRoutes);
app.use('/api/diet-plans',    dietPlanRoutes);
app.use('/api/recipes',       recipeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subscription',  subscriptionRoutes);

// ── AI Proxy: Forward /api/ai/* → FastAPI :8000 ───────────
// This covers: /chat, /ai/generate-plan, /ai/analyze-photo
app.use('/api/ai', createProxyMiddleware({
  target: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  changeOrigin: true,
  pathRewrite: { '^/api/ai': '/api' }, // /api/ai/chat → /api/chat
  on: {
    error: (err, req, res) => {
      console.error('[AI Proxy Error]', err.message);
      res.status(502).json({
        error: { code: 'AI_SERVICE_UNAVAILABLE', message: 'AI service is temporarily unavailable.' }
      });
    }
  }
}));

// ── 404 ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Endpoint not found.' } });
});

// ── Global Error Handler ──────────────────────────────────
app.use(errorHandler);

export default app;
