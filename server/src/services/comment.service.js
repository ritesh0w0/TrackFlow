const prisma = require('../config/prismaClient');
const logActivity = require('../utils/activityLogger');
const { verifyProjectMember } = require('./issue.service');

/**
 * Create a new comment on an issue.
 */
async function createComment(userId, issueId, data) {
  const { content } = data || {};

  if (!content || typeof content !== 'string' || content.trim().length === 0 || content.trim().length > 1000) {
    const error = new Error('Content is required and must be between 1 and 1000 characters');
    error.statusCode = 400;
    throw error;
  }

  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    select: { id: true, title: true, projectId: true },
  });

  if (!issue) {
    const error = new Error('Issue not found');
    error.statusCode = 404;
    throw error;
  }

  await verifyProjectMember(issue.projectId, userId);

  return await prisma.$transaction(async (tx) => {
    const comment = await tx.comment.create({
      data: {
        content: content.trim(),
        issueId,
        userId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await logActivity(
      {
        userId,
        action: 'COMMENT_CREATED',
        entityType: 'COMMENT',
        entityId: comment.id,
        projectId: issue.projectId,
        metadata: { issueId, issueTitle: issue.title, contentLength: comment.content.length },
      },
      tx
    );

    return comment;
  });
}

/**
 * List comments for an issue in ascending order of creation.
 */
async function getComments(userId, issueId) {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    select: { projectId: true },
  });

  if (!issue) {
    const error = new Error('Issue not found');
    error.statusCode = 404;
    throw error;
  }

  await verifyProjectMember(issue.projectId, userId);

  return await prisma.comment.findMany({
    where: { issueId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

/**
 * Update a comment. Only the original comment author may edit.
 */
async function updateComment(userId, commentId, data) {
  const { content } = data || {};

  if (!content || typeof content !== 'string' || content.trim().length === 0 || content.trim().length > 1000) {
    const error = new Error('Content is required and must be between 1 and 1000 characters');
    error.statusCode = 400;
    throw error;
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { issue: { select: { id: true, title: true, projectId: true } } },
  });

  if (!comment) {
    const error = new Error('Comment not found');
    error.statusCode = 404;
    throw error;
  }

  if (comment.userId !== userId) {
    const error = new Error('Forbidden: Only the author of the comment can edit it');
    error.statusCode = 403;
    throw error;
  }

  return await prisma.$transaction(async (tx) => {
    const updatedComment = await tx.comment.update({
      where: { id: commentId },
      data: { content: content.trim() },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await logActivity(
      {
        userId,
        action: 'COMMENT_UPDATED',
        entityType: 'COMMENT',
        entityId: commentId,
        projectId: comment.issue.projectId,
        metadata: { issueId: comment.issueId, issueTitle: comment.issue.title },
      },
      tx
    );

    return updatedComment;
  });
}

/**
 * Delete a comment. Only the original comment author may delete.
 */
async function deleteComment(userId, commentId) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { issue: { select: { id: true, title: true, projectId: true } } },
  });

  if (!comment) {
    const error = new Error('Comment not found');
    error.statusCode = 404;
    throw error;
  }

  if (comment.userId !== userId) {
    const error = new Error('Forbidden: Only the author of the comment can delete it');
    error.statusCode = 403;
    throw error;
  }

  await prisma.$transaction(async (tx) => {
    await logActivity(
      {
        userId,
        action: 'COMMENT_DELETED',
        entityType: 'COMMENT',
        entityId: commentId,
        projectId: comment.issue.projectId,
        metadata: { issueId: comment.issueId, issueTitle: comment.issue.title },
      },
      tx
    );

    await tx.comment.delete({
      where: { id: commentId },
    });
  });
}

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
