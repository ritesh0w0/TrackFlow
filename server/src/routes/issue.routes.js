const express = require('express');
const {
  createIssueController,
  getIssuesController,
  getAllMyIssuesController,
  getIssueByIdController,
  updateIssueController,
  deleteIssueController,
  assignIssueController,
  updateIssueStatusController,
  updateIssuePriorityController,
} = require('../controllers/issue.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

// Workspace-level issues list
router.get('/issues', getAllMyIssuesController);

// Project-scoped issue routes
router.post('/projects/:projectId/issues', createIssueController);
router.get('/projects/:projectId/issues', getIssuesController);

// Issue-scoped routes
router.get('/issues/:id', getIssueByIdController);
router.patch('/issues/:id', updateIssueController);
router.delete('/issues/:id', deleteIssueController);
router.patch('/issues/:id/assign', assignIssueController);
router.patch('/issues/:id/status', updateIssueStatusController);
router.patch('/issues/:id/priority', updateIssuePriorityController);

module.exports = router;
