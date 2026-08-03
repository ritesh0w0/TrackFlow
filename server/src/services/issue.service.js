const prisma = require('../config/prismaClient');

/**
 * Helper to log activity
 */
async function logActivity(tx, entityType, entityId, userId, action, metadata = {}) {
  await tx.activityLog.create({
    data: {
      entityType,
      entityId,
      userId,
      action,
      metadata,
    },
  });
}

/**
 * Helper to verify user belongs to the project
 */
async function verifyProjectMember(projectId, userId) {
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

async function createIssue(userId, projectId, data) {
  await verifyProjectMember(projectId, userId);

  return await prisma.$transaction(async (tx) => {
    const issue = await tx.issue.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || 'TODO',
        priority: data.priority || 'MEDIUM',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        projectId,
        reporterId: userId,
        assigneeId: data.assigneeId || null,
      },
    });

    await logActivity(tx, 'ISSUE', issue.id, userId, 'Issue Created', {
      title: issue.title,
      status: issue.status,
      priority: issue.priority,
    });

    return issue;
  });
}

async function getIssues(userId, projectId, queryParams) {
  await verifyProjectMember(projectId, userId);

  const { status, priority, assignee, search, page = 1, limit = 20 } = queryParams;

  const where = {
    projectId,
  };

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (assignee) where.assigneeId = assignee;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [issues, total] = await Promise.all([
    prisma.issue.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        assignee: { select: { id: true, name: true } },
        reporter: { select: { id: true, name: true } },
      }
    }),
    prisma.issue.count({ where }),
  ]);

  return {
    data: issues,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
}

async function getIssueById(userId, issueId) {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
  });

  if (!issue) {
    const error = new Error('Issue not found');
    error.statusCode = 404;
    throw error;
  }

  // Ensure user is part of the project this issue belongs to
  await verifyProjectMember(issue.projectId, userId);

  const [fullIssue, activities] = await Promise.all([
    prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        assignee: { select: { id: true, name: true } },
        reporter: { select: { id: true, name: true } },
      },
    }),
    prisma.activityLog.findMany({
      where: { entityType: 'ISSUE', entityId: issueId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true } } },
    }),
  ]);

  return { ...fullIssue, activities };
}

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

  return await prisma.$transaction(async (tx) => {
    const updateData = {};
    const metadata = {};
    let hasChanges = false;

    if (data.title && data.title !== existingIssue.title) {
      updateData.title = data.title;
      metadata.title = { from: existingIssue.title, to: data.title };
      hasChanges = true;
    }
    if (data.description !== undefined && data.description !== existingIssue.description) {
      updateData.description = data.description;
      metadata.description = { changed: true };
      hasChanges = true;
    }
    if (data.status && data.status !== existingIssue.status) {
      updateData.status = data.status;
      metadata.status = { from: existingIssue.status, to: data.status };
      hasChanges = true;
    }
    if (data.priority && data.priority !== existingIssue.priority) {
      updateData.priority = data.priority;
      metadata.priority = { from: existingIssue.priority, to: data.priority };
      hasChanges = true;
    }
    if (data.assigneeId !== undefined && data.assigneeId !== existingIssue.assigneeId) {
      updateData.assigneeId = data.assigneeId;
      metadata.assigneeId = { from: existingIssue.assigneeId, to: data.assigneeId };
      hasChanges = true;
    }
    if (data.dueDate !== undefined) {
      const newDueDate = data.dueDate ? new Date(data.dueDate) : null;
      if (existingIssue.dueDate?.getTime() !== newDueDate?.getTime()) {
        updateData.dueDate = newDueDate;
        metadata.dueDate = { from: existingIssue.dueDate, to: newDueDate };
        hasChanges = true;
      }
    }

    if (!hasChanges) {
      return existingIssue;
    }

    const updatedIssue = await tx.issue.update({
      where: { id: issueId },
      data: updateData,
    });

    // Determine primary action string
    let actionStr = 'Issue Updated';
    if (metadata.status) actionStr = 'Status Changed';
    else if (metadata.assigneeId) actionStr = 'Assigned User';

    await logActivity(tx, 'ISSUE', issueId, userId, actionStr, metadata);

    return updatedIssue;
  });
}

async function deleteIssue(userId, issueId) {
  const existingIssue = await prisma.issue.findUnique({
    where: { id: issueId },
  });

  if (!existingIssue) {
    const error = new Error('Issue not found');
    error.statusCode = 404;
    throw error;
  }

  await verifyProjectMember(existingIssue.projectId, userId);

  await prisma.issue.delete({
    where: { id: issueId },
  });
}

module.exports = {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
};
