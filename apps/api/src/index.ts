import { app } from './app.js';
import { env } from './config/env.js';
import { connectDb, disconnectDb } from './config/db.js';

async function start(): Promise<void> {
  await connectDb();

  const server = app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });

  async function shutdown(): Promise<void> {
    console.log('Shutting down...');
    server.close();
    await disconnectDb();
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((error) => {
  console.error('Failed to start API:', error);
  process.exit(1);
});