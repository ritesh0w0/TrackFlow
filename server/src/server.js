require('dotenv').config();
const app = require('./app');
const prisma = require('./config/prismaClient');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';

const server = app.listen(PORT, HOST, () => {
  console.log(`[TrackFlow Server] Running on http://${HOST}:${PORT}`);
});

// Graceful shutdown handling
const handleShutdown = async (signal, exitCode = 0) => {
  console.log(`[TrackFlow Server] Received ${signal}, initiating graceful shutdown...`);
  server.close(async () => {
    console.log('[TrackFlow Server] Closed HTTP connections');
    try {
      await prisma.$disconnect();
      console.log('[TrackFlow Server] Disconnected Prisma database client');
      process.exit(exitCode);
    } catch (err) {
      console.error('[TrackFlow Server] Error disconnecting database:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM', 0));
process.on('SIGINT', () => handleShutdown('SIGINT', 0));

// Process reliability: catch fatal errors, disconnect resources, and exit cleanly for process supervisor restart
process.on('unhandledRejection', (reason, promise) => {
  console.error('[TrackFlow Server] Fatal unhandled promise rejection:', reason);
  handleShutdown('unhandledRejection', 1);
});

process.on('uncaughtException', (err) => {
  console.error('[TrackFlow Server] Fatal uncaught exception:', err);
  handleShutdown('uncaughtException', 1);
});