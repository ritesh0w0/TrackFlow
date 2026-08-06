const prisma = require('../config/prismaClient');
const { verifyProjectMember } = require('./issue.service');

/**
 * Fetch project activity timeline entries.
 * @param {string} userId - Requesting user ID
 * @param {string} projectId - Target project ID
 * @returns {Promise<Array>} Structured activity log records
 * @throws {Error} 404 if project not found, 403 if user not project member
 */
async function getProjectActivity(userId, projectId) {
  await verifyProjectMember(projectId, userId);

  const projectIssues = await prisma.issue.findMany({
    where: { projectId },
    select: { id: true },
  });
  const issueIds = projectIssues.map((issue) => issue.id);

  return await prisma.activityLog.findMany({
    where: {
      OR: [
        { entityType: 'PROJECT', entityId: projectId },
        { entityType: 'ISSUE', entityId: { in: issueIds } },
        { entityType: 'COMMENT', entityId: { in: issueIds } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      user: { select: { id: true, name: true } },
      action: true,
      entityType: true,
      entityId: true,
      metadata: true,
      createdAt: true,
    },
  });
}

module.exports = {
  getProjectActivity,
};
