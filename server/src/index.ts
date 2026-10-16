import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import dotenv from 'dotenv';
import { initializeDatabase } from './db.js';
import { vehicleRoutes } from './routes/vehicles.js';
import { bookingRoutes } from './routes/bookings.js';
import { locationRoutes } from './routes/locations.js';
import { contactRoutes } from './routes/contact.js';
import { extrasRoutes } from './routes/extras.js';
import { authRoutes } from './routes/auth.js';
import { quoteRoutes } from './routes/quote.js';
import { ownerRoutes } from './routes/owner.js';
import path from 'node:path';
import fs from 'node:fs';

dotenv.config();

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true },
  },
});

// Initialize database
initializeDatabase();
logger.info('Database initialized');

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '1mb' }));

// Request logging
app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url }, 'request');
  next();
});

// API Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/extras', extrasRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/quote', quoteRoutes);
app.use('/api/owner', ownerRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Centralized error handling
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Serve static frontend build if present
const clientDistPath = path.resolve(process.cwd(), '../dist');
const localDistPath = path.resolve(process.cwd(), './public');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else if (fs.existsSync(localDistPath)) {
  app.use(express.static(localDistPath));
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) return next();
    res.sendFile(path.join(localDistPath, 'index.html'));
  });
}

// 404 handler for API routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
