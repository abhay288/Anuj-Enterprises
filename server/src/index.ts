import { app } from './app.js';
import { connectDB } from './config/db.js';
import { seedDatabase } from './seeds/seed.js';

const PORT = process.env.PORT || 5000;

// Connect DB & Start Server
export const startServer = async () => {
  await connectDB();
  // Auto-seed initial demo data if database is fresh
  try {
    await seedDatabase();
  } catch (e) {
    console.log('Seed check finished');
  }

  const server = app.listen(PORT, () => {
    console.log(`⚡ [SERVER] Anuj Enterprises Platform running at http://localhost:${PORT}`);
  });

  return server;
};

// Start when executed directly
startServer();

export default app;
