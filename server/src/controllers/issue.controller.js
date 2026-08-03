const issueService = require('../services/issue.service');

async function createIssueController(req, res) {
  try {
    const issue = await issueService.createIssue(req.user.id, req.params.projectId, req.body);
    res.status(201).json(issue);
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
}

async function getIssuesController(req, res) {
  try {
    const issues = await issueService.getIssues(req.user.id, req.params.projectId, req.query);
    res.status(200).json(issues);
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
}

async function getIssueByIdController(req, res) {
  try {
    const issue = await issueService.getIssueById(req.user.id, req.params.id);
    res.status(200).json(issue);
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
}

async function updateIssueController(req, res) {
  try {
    const issue = await issueService.updateIssue(req.user.id, req.params.id, req.body);
    res.status(200).json(issue);
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
}

async function deleteIssueController(req, res) {
  try {
    await issueService.deleteIssue(req.user.id, req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
}

module.exports = {
  createIssueController,
  getIssuesController,
  getIssueByIdController,
  updateIssueController,
  deleteIssueController,
};
