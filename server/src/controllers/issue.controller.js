const issueService = require('../services/issue.service');

async function createIssueController(req, res) {
  try {
    const issue = await issueService.createIssue(req.user.id, req.params.projectId, req.body);
    return res.status(201).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
}

async function getIssuesController(req, res) {
  try {
    const result = await issueService.getIssues(req.user.id, req.params.projectId, req.query);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
}

async function getIssueByIdController(req, res) {
  try {
    const issue = await issueService.getIssueById(req.user.id, req.params.id);
    return res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
}

async function updateIssueController(req, res) {
  try {
    const allowedKeys = ['title', 'description', 'dueDate'];
    const bodyKeys = Object.keys(req.body || {});
    const disallowedKeys = bodyKeys.filter((key) => !allowedKeys.includes(key));
    if (disallowedKeys.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Fields [${disallowedKeys.join(', ')}] cannot be updated on this endpoint. Use dedicated endpoints for status, priority, or assignment.`,
      });
    }

    const issue = await issueService.updateIssue(req.user.id, req.params.id, req.body);
    return res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
}

async function deleteIssueController(req, res) {
  try {
    await issueService.deleteIssue(req.user.id, req.params.id);
    return res.status(200).json({
      success: true,
      data: { message: 'Issue deleted successfully' },
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
}

async function assignIssueController(req, res) {
  try {
    const { assigneeId } = req.body || {};
    const issue = await issueService.assignIssue(req.user.id, req.params.id, assigneeId !== undefined ? assigneeId : null);
    return res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
}

async function updateIssueStatusController(req, res) {
  try {
    const { status } = req.body || {};
    const issue = await issueService.updateIssueStatus(req.user.id, req.params.id, status);
    return res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    const errStatus = error.statusCode || 500;
    return res.status(errStatus).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
}

async function updateIssuePriorityController(req, res) {
  try {
    const { priority } = req.body || {};
    const issue = await issueService.updateIssuePriority(req.user.id, req.params.id, priority);
    return res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    const errStatus = error.statusCode || 500;
    return res.status(errStatus).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
}

module.exports = {
  createIssueController,
  getIssuesController,
  getIssueByIdController,
  updateIssueController,
  deleteIssueController,
  assignIssueController,
  updateIssueStatusController,
  updateIssuePriorityController,
};
