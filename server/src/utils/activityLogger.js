const prisma = require('../config/prismaClient');

/**
 * Log an activity entry to ActivityLog.
 * @param {Object} params - Activity log parameters
 * @param {string} params.userId - ID of the user performing the action
 * @param {string} params.action - Action name (e.g. "ISSUE_CREATED", "STATUS_CHANGED")
 * @param {string} params.entityType - Entity type (e.g. "ISSUE", "COMMENT", "PROJECT", "MEMBER")
 * @param {string} params.entityId - Entity ID
 * @param {string} [params.projectId] - Associated Project ID
 * @param {Object} [params.metadata] - Additional JSON metadata
 * @param {Object} [tx] - Optional Prisma transaction instance
 */
async function logActivity({ userId, action, entityType, entityId, projectId = null, metadata = null }, tx = null) {
  const db = tx || prisma;
  return await db.activityLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      projectId,
      metadata: metadata ? metadata : undefined,
    },
  });
}

module.exports = logActivity;
