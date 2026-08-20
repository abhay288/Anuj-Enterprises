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
import { seedDatabase } from './seeds/seed.js';

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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting for Public APIs
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP. Please try again after 15 minutes.', code: 'RATE_LIMIT_EXCEEDED' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 login attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts from this IP. Please wait 15 minutes before trying again.', code: 'AUTH_RATE_LIMIT' }
});

app.use('/api/', apiLimiter);
app.use('/api/v1/auth/login', authLimiter);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.json({
    success: true,
    service: 'Anuj Enterprises REST API Backend',
    status: 'ONLINE',
    database: isDbConnected ? 'CONNECTED' : 'DISCONNECTED',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
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

// Frontend Static Bundle Hosting (Single Server Option)
const possibleDistPaths = [
  path.resolve(process.cwd(), 'dist'),
  path.resolve(process.cwd(), '../dist'),
  path.resolve(__dirname, '../../dist'),
  path.resolve(__dirname, '../dist'),
  path.resolve(__dirname, '../../../dist')
];
const staticDistPath = possibleDistPaths.find(p => fs.existsSync(path.join(p, 'index.html')));

if (staticDistPath) {
  console.log(`📦 [STATIC] Serving frontend build from: ${staticDistPath}`);
  app.use(express.static(staticDistPath));

  // SPA fallback for React client-side routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(staticDistPath, 'index.html'));
  });
}

// Error Handler
app.use(errorHandler);

// Connect DB & Start Server
const startServer = async () => {
  await connectDB();
  // Auto-seed initial demo data if database is fresh
  try {
    await seedDatabase();
  } catch (e) {
    console.log('Seed check finished');
  }

  app.listen(PORT, () => {
    console.log(`⚡ [SERVER] Anuj Enterprises Platform running at http://localhost:${PORT}`);
  });
};

startServer();
