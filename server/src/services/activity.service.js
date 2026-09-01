const prisma = require('../config/prismaClient');
const { verifyProjectMember } = require('./issue.service');

/**
 * Fetch project activity timeline entries.
 */
async function getProjectActivity(userId, projectId) {
  await verifyProjectMember(projectId, userId);

  return await prisma.activityLog.findMany({
    where: {
      OR: [
        { projectId: projectId },
        { entityType: 'PROJECT', entityId: projectId },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      user: { select: { id: true, name: true, email: true } },
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
