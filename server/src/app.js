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

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to TrackFlow API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', issueRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', commentRoutes);
app.use('/api', activityRoutes);

module.exports = app;