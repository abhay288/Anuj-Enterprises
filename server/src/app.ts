import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import salesmanRoutes from './routes/salesmanRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import { addSSEClient, getConnectedClientsCount } from './utils/realtime.js';

dotenv.config();
// Also attempt loading server/.env or root .env if running from various roots
if (!process.env.MONGODB_URI) {
  try {
    const rootEnv = path.resolve(process.cwd(), '.env');
    const serverEnv = path.resolve(process.cwd(), 'server/.env');
    if (fs.existsSync(serverEnv)) dotenv.config({ path: serverEnv });
    else if (fs.existsSync(rootEnv)) dotenv.config({ path: rootEnv });
  } catch (e) {}
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Security & Parsing Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'https://anujfmcg.com',
  'https://www.anujfmcg.com',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(s => s.trim()) : [])
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-admin-auth', 'x-admin-key']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// URL normalization middleware for Vercel Serverless and reverse proxies
app.use((req, res, next) => {
  if (req.originalUrl && req.originalUrl.startsWith('/api') && (!req.url || req.url === '/api' || !req.url.startsWith('/api'))) {
    req.url = req.originalUrl;
  } else if (req.url && req.url.startsWith('/v1/')) {
    req.url = '/api' + req.url;
  }
  next();
});

// Middleware to ensure DB connection before executing API handlers
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') || req.url.startsWith('/api')) {
    try {
      await connectDB();
    } catch (dbErr: any) {
      console.error('Database connection middleware error:', dbErr.message);
    }
  }
  next();
});

// Rate Limiting for Public APIs
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP. Please try again after 15 minutes.', code: 'RATE_LIMIT_EXCEEDED' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 login/register attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts from this IP. Please wait 15 minutes before trying again.', code: 'AUTH_RATE_LIMIT' }
});

app.use('/api/', apiLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// Reverse Geocoding Proxy Endpoint
app.get(['/api/geocode/reverse', '/api/v1/geocode/reverse'], async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and Longitude are required' });
  }
  try {
    const osmRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'AnujEnterprisesApp/1.0 (contact@anujenterprises.com)',
          'Accept': 'application/json'
        }
      }
    );
    if (!osmRes.ok) {
      return res.status(osmRes.status).json({ error: `Upstream error ${osmRes.status}` });
    }
    const data = await osmRes.json();
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Geocoding failed' });
  }
});

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.json({
    success: true,
    service: 'Anuj Enterprises REST API Backend',
    status: 'ONLINE',
    database: isDbConnected ? 'CONNECTED' : 'DISCONNECTED',
    environment: process.env.NODE_ENV || 'development',
    sseClients: getConnectedClientsCount(),
    timestamp: new Date().toISOString()
  });
});

// Server-Sent Events (SSE) stream for real-time frontend updates
app.get('/api/v1/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() })}\n\n`);
  addSSEClient(res);

  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (e) {
      clearInterval(heartbeat);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/salesmen', salesmanRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/settings', settingRoutes);

// Frontend Static Bundle Hosting (Single Server Option)
const possibleDistPaths = [
  path.resolve(process.cwd(), 'dist'),
  path.resolve(process.cwd(), '../dist'),
  path.resolve(__dirname, '../../dist'),
  path.resolve(__dirname, '../dist'),
  path.resolve(__dirname, '../../../dist')
];
const staticDistPath = possibleDistPaths.find(p => fs.existsSync(path.join(p, 'index.html')));

if (staticDistPath && !process.env.VERCEL) {
  console.log(`📦 [STATIC] Serving frontend build from: ${staticDistPath}`);
  app.use(express.static(staticDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(staticDistPath, 'index.html'));
  });
}

// Error Handler
app.use(errorHandler);

export default app;
