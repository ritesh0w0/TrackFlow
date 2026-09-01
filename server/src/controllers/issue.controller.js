const issueService = require('../services/issue.service');
const {
  createIssueSchema,
  updateIssueSchema,
  assignIssueSchema,
  updateStatusSchema,
  updatePrioritySchema,
} = require('../validations/issue.validation');

async function createIssueController(req, res, next) {
  try {
    const validatedData = createIssueSchema.parse(req.body);
    const issue = await issueService.createIssue(req.user.id, req.params.projectId, validatedData);
    return res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: issue,
    });
  } catch (error) {
    if (error.name === 'ZodError' || error.issues) {
      return res.status(400).json({
        success: false,
        message: error.issues?.[0]?.message || error.errors?.[0]?.message || 'Validation error',
      });
    }
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to create issue',
    });
  }
}

async function getIssuesController(req, res, next) {
  try {
    const result = await issueService.getIssues(req.user.id, req.params.projectId, req.query);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to load issues',
    });
  }
}

async function getAllMyIssuesController(req, res, next) {
  try {
    const result = await issueService.getAllMyIssues(req.user.id, req.query);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to load workspace issues',
    });
  }
}

async function getIssueByIdController(req, res, next) {
  try {
    const issue = await issueService.getIssueById(req.user.id, req.params.id);
    return res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Issue not found',
    });
  }
}

async function updateIssueController(req, res, next) {
  try {
    const validatedData = updateIssueSchema.parse(req.body);
    const issue = await issueService.updateIssue(req.user.id, req.params.id, validatedData);
    return res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      data: issue,
    });
  } catch (error) {
    if (error.name === 'ZodError' || error.issues) {
      return res.status(400).json({
        success: false,
        message: error.issues?.[0]?.message || error.errors?.[0]?.message || 'Validation error',
      });
    }
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to update issue',
    });
  }
}

async function deleteIssueController(req, res, next) {
  try {
    await issueService.deleteIssue(req.user.id, req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Issue deleted successfully',
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to delete issue',
    });
  }
}

async function assignIssueController(req, res, next) {
  try {
    const validatedData = assignIssueSchema.parse(req.body);
    const issue = await issueService.assignIssue(
      req.user.id,
      req.params.id,
      validatedData.assigneeId !== undefined ? validatedData.assigneeId : null
    );
    return res.status(200).json({
      success: true,
      message: 'Assignee updated successfully',
      data: issue,
    });
  } catch (error) {
    if (error.name === 'ZodError' || error.issues) {
      return res.status(400).json({
        success: false,
        message: error.issues?.[0]?.message || error.errors?.[0]?.message || 'Validation error',
      });
    }
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to assign issue',
    });
  }
}

async function updateIssueStatusController(req, res, next) {
  try {
    const validatedData = updateStatusSchema.parse(req.body);
    const issue = await issueService.updateIssueStatus(req.user.id, req.params.id, validatedData.status);
    return res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: issue,
    });
  } catch (error) {
    if (error.name === 'ZodError' || error.issues) {
      return res.status(400).json({
        success: false,
        message: error.issues?.[0]?.message || error.errors?.[0]?.message || 'Validation error',
      });
    }
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to update issue status',
    });
  }
}

async function updateIssuePriorityController(req, res, next) {
  try {
    const validatedData = updatePrioritySchema.parse(req.body);
    const issue = await issueService.updateIssuePriority(req.user.id, req.params.id, validatedData.priority);
    return res.status(200).json({
      success: true,
      message: 'Priority updated successfully',
      data: issue,
    });
  } catch (error) {
    if (error.name === 'ZodError' || error.issues) {
      return res.status(400).json({
        success: false,
        message: error.issues?.[0]?.message || error.errors?.[0]?.message || 'Validation error',
      });
    }
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to update issue priority',
    });
  }
}

module.exports = {
  createIssueController,
  getIssuesController,
  getAllMyIssuesController,
  getIssueByIdController,
  updateIssueController,
  deleteIssueController,
  assignIssueController,
  updateIssueStatusController,
  updateIssuePriorityController,
};
