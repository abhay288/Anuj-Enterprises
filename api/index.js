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

import app from '../server/dist/app.js';

export default app;
