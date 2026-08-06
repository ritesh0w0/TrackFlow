const prisma = require('../config/prismaClient');
const logActivity = require('../utils/activityLogger');
const { verifyProjectMember } = require('./issue.service');

/**
 * Create a new comment on an issue.
 * @param {string} userId - Requesting user ID (author)
 * @param {string} issueId - Target issue ID
 * @param {Object} data - Payload containing content
 * @returns {Promise<Object>} Created comment record (excluding user credentials)
 * @throws {Error} 400 on invalid content, 404 if issue not found, 403 if user not project member
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
        user: { select: { id: true, name: true } },
      },
    });

    await logActivity(
      {
        userId,
        action: 'COMMENT_CREATED',
        entityType: 'COMMENT',
        entityId: comment.id,
        metadata: { issueId, contentLength: comment.content.length },
      },
      tx
    );

    return comment;
  });
}

/**
 * List comments for an issue in ascending order of creation.
 * @param {string} userId - Requesting user ID
 * @param {string} issueId - Target issue ID
 * @returns {Promise<Array>} List of comment objects
 * @throws {Error} 404 if issue not found, 403 if user not project member
 */
async function getComments(userId, issueId) {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
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
      user: { select: { id: true, name: true } },
    },
  });
}

/**
 * Update a comment. Only the original comment author may edit.
 * @param {string} userId - Requesting user ID
 * @param {string} commentId - Comment ID
 * @param {Object} data - Payload containing content
 * @returns {Promise<Object>} Updated comment object
 * @throws {Error} 400 on invalid content, 404 if comment not found, 403 if user not author
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
    include: { issue: { select: { projectId: true } } },
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
        user: { select: { id: true, name: true } },
      },
    });

    await logActivity(
      {
        userId,
        action: 'COMMENT_UPDATED',
        entityType: 'COMMENT',
        entityId: commentId,
        metadata: { issueId: comment.issueId },
      },
      tx
    );

    return updatedComment;
  });
}

/**
 * Delete a comment. Only the original comment author may delete.
 * @param {string} userId - Requesting user ID
 * @param {string} commentId - Comment ID
 * @returns {Promise<void>}
 * @throws {Error} 404 if comment not found, 403 if user not author
 */
async function deleteComment(userId, commentId) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
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
        metadata: { issueId: comment.issueId },
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
