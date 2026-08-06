const prisma = require('../config/prismaClient');
const logActivity = require('../utils/activityLogger');

const VALID_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

/**
 * Verify that a project exists and that a user is a member of it.
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} ProjectMember record
 * @throws {Error} 404 if project does not exist, 403 if user is not a member
 */
async function verifyProjectMember(projectId, userId) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });
  if (!member) {
    const error = new Error('Forbidden: You are not a member of this project');
    error.statusCode = 403;
    throw error;
  }
  return member;
}

/**
 * Create a new issue within a project.
 * @param {string} userId - Reporter user ID
 * @param {string} projectId - Target project ID
 * @param {Object} data - Issue creation payload
 * @returns {Promise<Object>} Created issue object
 * @throws {Error} 400 on validation error, 403 if not member, 404 if project not found
 */
async function createIssue(userId, projectId, data) {
  await verifyProjectMember(projectId, userId);

  const { title, description, priority = 'MEDIUM', dueDate } = data;

  if (!title || typeof title !== 'string' || title.trim().length === 0 || title.trim().length > 200) {
    const error = new Error('Title is required and must be between 1 and 200 characters');
    error.statusCode = 400;
    throw error;
  }

  if (description && (typeof description !== 'string' || description.length > 5000)) {
    const error = new Error('Description must not exceed 5000 characters');
    error.statusCode = 400;
    throw error;
  }

  if (priority && !VALID_PRIORITIES.includes(priority)) {
    const error = new Error(`Invalid priority. Allowed values: ${VALID_PRIORITIES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  let parsedDueDate = null;
  if (dueDate) {
    parsedDueDate = new Date(dueDate);
    if (isNaN(parsedDueDate.getTime())) {
      const error = new Error('Invalid dueDate format. Must be a valid ISO date');
      error.statusCode = 400;
      throw error;
    }
  }

  return await prisma.$transaction(async (tx) => {
    const issue = await tx.issue.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        status: 'TODO',
        priority,
        dueDate: parsedDueDate,
        projectId,
        reporterId: userId,
      },
      include: {
        reporter: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
    });

    await logActivity(
      {
        userId,
        action: 'ISSUE_CREATED',
        entityType: 'ISSUE',
        entityId: issue.id,
        metadata: { title: issue.title, priority: issue.priority },
      },
      tx
    );

    return issue;
  });
}

/**
 * List issues for a project with filtering and pagination.
 * @param {string} userId - Requesting user ID
 * @param {string} projectId - Project ID
 * @param {Object} queryParams - Query params for filtering/pagination
 * @returns {Promise<Object>} Object containing issues list, page, pages, and total count
 * @throws {Error} 400 on invalid query params, 403 if not member, 404 if project not found
 */
async function getIssues(userId, projectId, queryParams) {
  await verifyProjectMember(projectId, userId);

  const { status, priority, assigneeId, search, page = 1, limit = 20 } = queryParams;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const whereConditions = [{ projectId }];

  if (status) {
    if (!VALID_STATUSES.includes(status)) {
      const error = new Error(`Invalid status filter. Allowed values: ${VALID_STATUSES.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }
    whereConditions.push({ status });
  }

  if (priority) {
    if (!VALID_PRIORITIES.includes(priority)) {
      const error = new Error(`Invalid priority filter. Allowed values: ${VALID_PRIORITIES.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }
    whereConditions.push({ priority });
  }

  if (assigneeId) {
    whereConditions.push({ assigneeId });
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    const searchStr = search.trim();
    whereConditions.push({
      title: { contains: searchStr, mode: 'insensitive' },
    });
  }

  const where = { AND: whereConditions };

  const skip = (pageNum - 1) * limitNum;

  const [issues, total] = await Promise.all([
    prisma.issue.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
    }),
    prisma.issue.count({ where }),
  ]);

  const pages = Math.ceil(total / limitNum) || (total === 0 ? 0 : 1);

  return {
    issues,
    page: pageNum,
    pages,
    total,
  };
}

/**
 * Get a single issue by ID.
 * @param {string} userId - Requesting user ID
 * @param {string} issueId - Issue ID
 * @returns {Promise<Object>} Issue object with reporter, assignee, and comment count
 * @throws {Error} 404 if issue/project not found, 403 if user not project member
 */
async function getIssueById(userId, issueId) {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: {
      reporter: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } },
      _count: { select: { comments: true } },
    },
  });

  if (!issue) {
    const error = new Error('Issue not found');
    error.statusCode = 404;
    throw error;
  }

  await verifyProjectMember(issue.projectId, userId);

  return issue;
}

/**
 * Update issue fields (title, description, dueDate).
 * @param {string} userId - User ID updating issue
 * @param {string} issueId - Target issue ID
 * @param {Object} data - Payload containing fields to update
 * @returns {Promise<Object>} Updated issue object
 * @throws {Error} 400 on invalid input, 404 if issue not found, 403 if user not member
 */
async function updateIssue(userId, issueId, data) {
  const existingIssue = await prisma.issue.findUnique({
    where: { id: issueId },
  });

  if (!existingIssue) {
    const error = new Error('Issue not found');
    error.statusCode = 404;
    throw error;
  }

  await verifyProjectMember(existingIssue.projectId, userId);

  const { title, description, dueDate } = data;

  const updateData = {};
  const changedFields = {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0 || title.trim().length > 200) {
      const error = new Error('Title must be between 1 and 200 characters');
      error.statusCode = 400;
      throw error;
    }
    if (title.trim() !== existingIssue.title) {
      updateData.title = title.trim();
      changedFields.title = { from: existingIssue.title, to: title.trim() };
    }
  }

  if (description !== undefined) {
    if (description !== null && (typeof description !== 'string' || description.length > 5000)) {
      const error = new Error('Description must not exceed 5000 characters');
      error.statusCode = 400;
      throw error;
    }
    const newDesc = description ? description.trim() : null;
    if (newDesc !== existingIssue.description) {
      updateData.description = newDesc;
      changedFields.description = { changed: true };
    }
  }

  if (dueDate !== undefined) {
    let newDueDate = null;
    if (dueDate) {
      newDueDate = new Date(dueDate);
      if (isNaN(newDueDate.getTime())) {
        const error = new Error('Invalid dueDate format');
        error.statusCode = 400;
        throw error;
      }
    }
    const existingTime = existingIssue.dueDate ? existingIssue.dueDate.getTime() : null;
    const newTime = newDueDate ? newDueDate.getTime() : null;
    if (existingTime !== newTime) {
      updateData.dueDate = newDueDate;
      changedFields.dueDate = { from: existingIssue.dueDate, to: newDueDate };
    }
  }

  if (Object.keys(updateData).length === 0) {
    return existingIssue;
  }

  return await prisma.$transaction(async (tx) => {
    const updatedIssue = await tx.issue.update({
      where: { id: issueId },
      data: updateData,
      include: {
        reporter: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
    });

    await logActivity(
      {
        userId,
        action: 'ISSUE_UPDATED',
        entityType: 'ISSUE',
        entityId: issueId,
        metadata: changedFields,
      },
      tx
    );

    return updatedIssue;
  });
}

/**
 * Delete an issue. Restricted to project OWNER or ADMIN role.
 * @param {string} userId - User ID requesting deletion
 * @param {string} issueId - Issue ID to delete
 * @returns {Promise<void>}
 * @throws {Error} 404 if issue not found, 403 if not OWNER/ADMIN
 */
async function deleteIssue(userId, issueId) {
  const existingIssue = await prisma.issue.findUnique({
    where: { id: issueId },
  });

  if (!existingIssue) {
    const error = new Error('Issue not found');
    error.statusCode = 404;
    throw error;
  }

  const member = await verifyProjectMember(existingIssue.projectId, userId);

  if (member.role !== 'OWNER' && member.role !== 'ADMIN') {
    const error = new Error('Forbidden: Only project OWNER or ADMIN can delete issues');
    error.statusCode = 403;
    throw error;
  }

  await prisma.$transaction(async (tx) => {
    await logActivity(
      {
        userId,
        action: 'ISSUE_DELETED',
        entityType: 'PROJECT',
        entityId: existingIssue.projectId,
        metadata: { issueId, title: existingIssue.title },
      },
      tx
    );

    await tx.issue.delete({
      where: { id: issueId },
    });
  });
}

/**
 * Assign an issue to a project member.
 * @param {string} userId - Requesting user ID
 * @param {string} issueId - Issue ID
 * @param {string|null} assigneeId - Assignee user ID or null to unassign
 * @returns {Promise<Object>} Updated issue object
 * @throws {Error} 400/404 if assignee user invalid/not project member, 403 if requester not member
 */
async function assignIssue(userId, issueId, assigneeId) {
  const existingIssue = await prisma.issue.findUnique({
    where: { id: issueId },
  });

  if (!existingIssue) {
    const error = new Error('Issue not found');
    error.statusCode = 404;
    throw error;
  }

  await verifyProjectMember(existingIssue.projectId, userId);

  let targetAssigneeId = null;

  if (assigneeId) {
    const assigneeUser = await prisma.user.findUnique({
      where: { id: assigneeId },
    });
    if (!assigneeUser) {
      const error = new Error('Assignee user not found');
      error.statusCode = 404;
      throw error;
    }

    const assigneeMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: assigneeId,
          projectId: existingIssue.projectId,
        },
      },
    });
    if (!assigneeMember) {
      const error = new Error('Assignee must be a member of the project');
      error.statusCode = 400;
      throw error;
    }
    targetAssigneeId = assigneeId;
  }

  if (existingIssue.assigneeId === targetAssigneeId) {
    return existingIssue;
  }

  return await prisma.$transaction(async (tx) => {
    const updatedIssue = await tx.issue.update({
      where: { id: issueId },
      data: { assigneeId: targetAssigneeId },
      include: {
        reporter: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
    });

    await logActivity(
      {
        userId,
        action: 'ISSUE_ASSIGNED',
        entityType: 'ISSUE',
        entityId: issueId,
        metadata: { from: existingIssue.assigneeId, to: targetAssigneeId },
      },
      tx
    );

    return updatedIssue;
  });
}

/**
 * Change issue status.
 * @param {string} userId - Requesting user ID
 * @param {string} issueId - Issue ID
 * @param {string} status - New status string
 * @returns {Promise<Object>} Updated issue object
 * @throws {Error} 400 on invalid status enum, 404 if issue not found, 403 if user not member
 */
async function updateIssueStatus(userId, issueId, status) {
  if (!status || !VALID_STATUSES.includes(status)) {
    const error = new Error(`Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const existingIssue = await prisma.issue.findUnique({
    where: { id: issueId },
  });

  if (!existingIssue) {
    const error = new Error('Issue not found');
    error.statusCode = 404;
    throw error;
  }

  await verifyProjectMember(existingIssue.projectId, userId);

  if (existingIssue.status === status) {
    return existingIssue;
  }

  return await prisma.$transaction(async (tx) => {
    const updatedIssue = await tx.issue.update({
      where: { id: issueId },
      data: { status },
      include: {
        reporter: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
    });

    await logActivity(
      {
        userId,
        action: 'STATUS_CHANGED',
        entityType: 'ISSUE',
        entityId: issueId,
        metadata: { from: existingIssue.status, to: status },
      },
      tx
    );

    return updatedIssue;
  });
}

/**
 * Change issue priority.
 * @param {string} userId - Requesting user ID
 * @param {string} issueId - Issue ID
 * @param {string} priority - New priority string
 * @returns {Promise<Object>} Updated issue object
 * @throws {Error} 400 on invalid priority enum, 404 if issue not found, 403 if user not member
 */
async function updateIssuePriority(userId, issueId, priority) {
  if (!priority || !VALID_PRIORITIES.includes(priority)) {
    const error = new Error(`Invalid priority. Allowed values: ${VALID_PRIORITIES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const existingIssue = await prisma.issue.findUnique({
    where: { id: issueId },
  });

  if (!existingIssue) {
    const error = new Error('Issue not found');
    error.statusCode = 404;
    throw error;
  }

  await verifyProjectMember(existingIssue.projectId, userId);

  if (existingIssue.priority === priority) {
    return existingIssue;
  }

  return await prisma.$transaction(async (tx) => {
    const updatedIssue = await tx.issue.update({
      where: { id: issueId },
      data: { priority },
      include: {
        reporter: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
    });

    await logActivity(
      {
        userId,
        action: 'PRIORITY_CHANGED',
        entityType: 'ISSUE',
        entityId: issueId,
        metadata: { from: existingIssue.priority, to: priority },
      },
      tx
    );

    return updatedIssue;
  });
}

module.exports = {
  verifyProjectMember,
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  assignIssue,
  updateIssueStatus,
  updateIssuePriority,
};
