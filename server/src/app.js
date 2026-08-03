const express = require('express');
const authRoutes = require('./routes/auth.routes');

const projectRoutes = require('./routes/project.routes');
const issueRoutes = require('./routes/issue.routes');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to TrackFlow API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', issueRoutes);

module.exports = app;