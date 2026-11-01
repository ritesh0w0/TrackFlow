const { PrismaClient } = require('@prisma/client');

// Optimize Prisma connection pool for serverless Neon PostgreSQL.
// Default Prisma pool size is (num_cores * 2 + 1), which can exhaust
// Neon's connection limits when multiple processes (server + test runner) run.
function getDatasourceUrl() {
  let url = process.env.DATABASE_URL;
  if (!url) return undefined;

  const hasParams = url.includes('?');
  const separator = hasParams ? '&' : '?';
  const additions = [];

  if (!url.includes('connection_limit')) {
    // 5 connections per process is optimal for small/medium Neon instances
    additions.push('connection_limit=5');
  }
  if (!url.includes('pool_timeout')) {
    additions.push('pool_timeout=15');
  }
  if (!url.includes('connect_timeout')) {
    additions.push('connect_timeout=15');
  }

  if (additions.length > 0) {
    url = `${url}${separator}${additions.join('&')}`;
  }

  return url;
}

const datasourceUrl = getDatasourceUrl();

const prisma = new PrismaClient(
  datasourceUrl
    ? {
        datasources: {
          db: {
            url: datasourceUrl,
          },
        },
      }
    : undefined
);

module.exports = prisma;
