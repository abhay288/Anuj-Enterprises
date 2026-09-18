import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Pre-load environment variables if running in serverless container
if (!process.env.MONGODB_URI) {
  try {
    const serverEnv = path.resolve(process.cwd(), 'server/.env');
    const rootEnv = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(serverEnv)) dotenv.config({ path: serverEnv });
    else if (fs.existsSync(rootEnv)) dotenv.config({ path: rootEnv });
  } catch (e) {}
}

import { app } from '../server/dist/app.js';
import { connectDB } from '../server/dist/config/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (dbErr) {
    console.error('[Vercel Serverless] DB connection error:', dbErr.message);
  }

  // Restore original URL if Vercel rewrite collapsed path to /api
  if (req.originalUrl && req.originalUrl.startsWith('/api')) {
    req.url = req.originalUrl;
  } else if (req.url && req.url.startsWith('/v1/')) {
    req.url = '/api' + req.url;
  }

  return app(req, res);
}
