const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const issueRoutes = require('./routes/issue.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const commentRoutes = require('./routes/comment.routes');
const activityRoutes = require('./routes/activity.routes');

const app = express();

// Trust proxy when behind reverse proxy (Render, Heroku, Nginx)
app.set('trust proxy', 1);

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(null, true); // Permissive fallback for deployment previews
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body and Cookie Parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Simple in-memory auth rate-limiter
const authAttempts = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_AUTH_ATTEMPTS = 30; // 30 requests per minute

function authRateLimiter(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = authAttempts.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + RATE_LIMIT_WINDOW_MS;
  }

  record.count += 1;
  authAttempts.set(ip, record);

  if (record.count > MAX_AUTH_ATTEMPTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please wait a minute and try again.',
    });
  }

  next();
}

// Clean up stale rate-limit keys every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of authAttempts.entries()) {
    if (now > record.resetTime) {
      authAttempts.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref();

// Root & Health check endpoints
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    name: 'TrackFlow API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({
    status: 'ok',
  });
});

// API Routes
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', issueRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', commentRoutes);
app.use('/api', activityRoutes);

// 404 Handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

module.exports = app;