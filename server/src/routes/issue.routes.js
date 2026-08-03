const express = require('express');
const {
  createIssueController,
  getIssuesController,
  getIssueByIdController,
  updateIssueController,
  deleteIssueController,
} = require('../controllers/issue.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

// Routes scoped by project
router.post('/projects/:projectId/issues', createIssueController);
router.get('/projects/:projectId/issues', getIssuesController);

// Routes scoped by issue directly
router.get('/issues/:id', getIssueByIdController);
router.patch('/issues/:id', updateIssueController);
router.delete('/issues/:id', deleteIssueController);

module.exports = router;
