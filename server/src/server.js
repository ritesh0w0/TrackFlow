require('dotenv').config();
const app = require('./app');
const prisma = require('./config/prismaClient');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`[TrackFlow Server] Running on http://localhost:${PORT}`);
});

// Graceful shutdown handling
const handleShutdown = async (signal) => {
  console.log(`[TrackFlow Server] Received ${signal}, initiating graceful shutdown...`);
  server.close(async () => {
    console.log('[TrackFlow Server] Closed HTTP connections');
    try {
      await prisma.$disconnect();
      console.log('[TrackFlow Server] Disconnected Prisma database client');
      process.exit(0);
    } catch (err) {
      console.error('[TrackFlow Server] Error disconnecting database:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));