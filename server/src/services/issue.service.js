const prisma = require('../config/prismaClient');
const logActivity = require('../utils/activityLogger');
const { VALID_STATUSES, VALID_PRIORITIES } = require('../validations/issue.validation');

/**
 * Verify that a project exists and that a user is a member of it.
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
 */
async function createIssue(userId, projectId, data) {
  await verifyProjectMember(projectId, userId);

  const { title, description, priority = 'MEDIUM', dueDate, tags = [] } = data;

  let parsedDueDate = null;
  if (dueDate) {
    parsedDueDate = new Date(dueDate);
    if (isNaN(parsedDueDate.getTime())) {
      const error = new Error('Invalid dueDate format');
      error.statusCode = 400;
      throw error;
    }
  }

  const cleanTags = Array.isArray(tags)
    ? tags.map((t) => String(t).trim()).filter((t) => t.length > 0)
    : [];

  return await prisma.$transaction(async (tx) => {
    const issue = await tx.issue.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        status: 'TODO',
        priority,
        dueDate: parsedDueDate,
        tags: cleanTags,
        resolvedAt: null,
        projectId,
        reporterId: userId,
      },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true } },
      },
    });

    await logActivity(
      {
        userId,
        action: 'ISSUE_CREATED',
        entityType: 'ISSUE',
        entityId: issue.id,
        projectId,
        metadata: { title: issue.title, priority: issue.priority, tags: cleanTags },
      },
      tx
    );

    return issue;
  });
}

/**
 * List issues for a project with filtering, search, sorting, and pagination.
 */
async function getIssues(userId, projectId, queryParams) {
  await verifyProjectMember(projectId, userId);

  const {
    status,
    priority,
    assigneeId,
    reporterId,
    tag,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 20,
  } = queryParams;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const whereConditions = [{ projectId }];

  if (status && VALID_STATUSES.includes(status)) {
    whereConditions.push({ status });
  }

  if (priority && VALID_PRIORITIES.includes(priority)) {
    whereConditions.push({ priority });
  }

  if (assigneeId) {
    if (assigneeId === 'unassigned') {
      whereConditions.push({ assigneeId: null });
    } else {
      whereConditions.push({ assigneeId });
    }
  }

  if (reporterId) {
    whereConditions.push({ reporterId });
  }

  if (tag && typeof tag === 'string' && tag.trim() !== '') {
    whereConditions.push({
      tags: { has: tag.trim() },
    });
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    const searchStr = search.trim();
    whereConditions.push({
      OR: [
        { title: { contains: searchStr, mode: 'insensitive' } },
        { description: { contains: searchStr, mode: 'insensitive' } },
      ],
    });
  }

  const where = { AND: whereConditions };
  const skip = (pageNum - 1) * limitNum;

  const validSortFields = ['createdAt', 'updatedAt', 'dueDate', 'priority', 'status', 'title'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const orderDirection = sortOrder === 'asc' ? 'asc' : 'desc';

  const [issues, total] = await Promise.all([
    prisma.issue.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { [sortField]: orderDirection },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        _count: { select: { comments: true } },
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
 * Get all issues across all projects the user is a member of (workspace-wide feed).
 */
async function getAllMyIssues(userId, queryParams) {
  const userProjects = await prisma.projectMember.findMany({
    where: { userId },
    select: { projectId: true },
  });

  const projectIds = userProjects.map((p) => p.projectId);
  if (projectIds.length === 0) {
    return { issues: [], page: 1, pages: 0, total: 0 };
  }

  const {
    status,
    priority,
    assigneeId,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 20,
  } = queryParams;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const whereConditions = [{ projectId: { in: projectIds } }];

  if (status && VALID_STATUSES.includes(status)) {
    whereConditions.push({ status });
  }

  if (priority && VALID_PRIORITIES.includes(priority)) {
    whereConditions.push({ priority });
  }

  if (assigneeId) {
    if (assigneeId === 'me') {
      whereConditions.push({ assigneeId: userId });
    } else if (assigneeId === 'unassigned') {
      whereConditions.push({ assigneeId: null });
    } else {
      whereConditions.push({ assigneeId });
    }
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    const searchStr = search.trim();
    whereConditions.push({
      OR: [
        { title: { contains: searchStr, mode: 'insensitive' } },
        { description: { contains: searchStr, mode: 'insensitive' } },
      ],
    });
  }

  const where = { AND: whereConditions };
  const skip = (pageNum - 1) * limitNum;

  const validSortFields = ['createdAt', 'updatedAt', 'dueDate', 'priority', 'status', 'title'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const orderDirection = sortOrder === 'asc' ? 'asc' : 'desc';

  const [issues, total] = await Promise.all([
    prisma.issue.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { [sortField]: orderDirection },
      include: {
        reporter: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, title: true } },
        _count: { select: { comments: true } },
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
 */
async function getIssueById(userId, issueId) {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      project: {
        select: {
          id: true,
          title: true,
          members: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      },
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
 * Update issue fields.
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

  const { title, description, priority, dueDate, tags } = data;
  const updateData = {};
  const changedFields = {};

  if (title !== undefined) {
    if (title.trim() !== existingIssue.title) {
      updateData.title = title.trim();
      changedFields.title = { from: existingIssue.title, to: title.trim() };
    }
  }

  if (description !== undefined) {
    const newDesc = description ? description.trim() : null;
    if (newDesc !== existingIssue.description) {
      updateData.description = newDesc;
      changedFields.description = { changed: true };
    }
  }

  if (priority !== undefined && VALID_PRIORITIES.includes(priority)) {
    if (priority !== existingIssue.priority) {
      updateData.priority = priority;
      changedFields.priority = { from: existingIssue.priority, to: priority };
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

  if (tags !== undefined && Array.isArray(tags)) {
    const cleanTags = tags.map((t) => String(t).trim()).filter((t) => t.length > 0);
    updateData.tags = cleanTags;
    changedFields.tags = cleanTags;
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
        project: { select: { id: true, title: true } },
      },
    });

    await logActivity(
      {
        userId,
        action: 'ISSUE_UPDATED',
        entityType: 'ISSUE',
        entityId: issueId,
        projectId: existingIssue.projectId,
        metadata: changedFields,
      },
      tx
    );

    return updatedIssue;
  });
}

/**
 * Delete an issue. Restricted to project OWNER or ADMIN role.
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
        projectId: existingIssue.projectId,
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
    const assigneeMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: assigneeId,
          projectId: existingIssue.projectId,
        },
      },
      include: { user: { select: { name: true } } },
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
        project: { select: { id: true, title: true } },
      },
    });

    await logActivity(
      {
        userId,
        action: 'ISSUE_ASSIGNED',
        entityType: 'ISSUE',
        entityId: issueId,
        projectId: existingIssue.projectId,
        metadata: { from: existingIssue.assigneeId, to: targetAssigneeId },
      },
      tx
    );

    return updatedIssue;
  });
}

/**
 * Change issue status and manage resolvedAt timestamp.
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

  const resolvedAt = status === 'DONE' ? new Date() : (existingIssue.status === 'DONE' ? null : existingIssue.resolvedAt);

  return await prisma.$transaction(async (tx) => {
    const updatedIssue = await tx.issue.update({
      where: { id: issueId },
      data: {
        status,
        resolvedAt,
      },
      include: {
        reporter: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, title: true } },
      },
    });

    await logActivity(
      {
        userId,
        action: 'STATUS_CHANGED',
        entityType: 'ISSUE',
        entityId: issueId,
        projectId: existingIssue.projectId,
        metadata: { from: existingIssue.status, to: status },
      },
      tx
    );

    return updatedIssue;
  });
}

/**
 * Change issue priority.
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
        project: { select: { id: true, title: true } },
      },
    });

    await logActivity(
      {
        userId,
        action: 'PRIORITY_CHANGED',
        entityType: 'ISSUE',
        entityId: issueId,
        projectId: existingIssue.projectId,
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
  getAllMyIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  assignIssue,
  updateIssueStatus,
  updateIssuePriority,
};
