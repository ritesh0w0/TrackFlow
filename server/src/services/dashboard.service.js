const prisma = require('../config/prismaClient');
const { verifyProjectMember } = require('./issue.service');

/**
 * Get project dashboard analytics and stats.
 * Runs all independent aggregation queries concurrently using Promise.all().
 * @param {string} userId - Requesting user ID
 * @param {string} projectId - Target project ID
 * @returns {Promise<Object>} Dashboard analytics object
 * @throws {Error} 404 if project not found, 403 if user not member
 */
async function getProjectDashboard(userId, projectId) {
  await verifyProjectMember(projectId, userId);

  const now = new Date();

  // Fetch issue IDs belonging to this project for activity filtering
  const projectIssues = await prisma.issue.findMany({
    where: { projectId },
    select: { id: true },
  });
  const issueIds = projectIssues.map((issue) => issue.id);

  const [
    project,
    totalIssues,
    statusCounts,
    priorityCounts,
    recentIssues,
    overdueIssues,
    recentActivity,
  ] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, title: true, description: true },
    }),
    prisma.issue.count({
      where: { projectId },
    }),
    prisma.issue.groupBy({
      by: ['status'],
      where: { projectId },
      _count: { _all: true },
    }),
    prisma.issue.groupBy({
      by: ['priority'],
      where: { projectId },
      _count: { _all: true },
    }),
    prisma.issue.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        reporter: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
    }),
    prisma.issue.findMany({
      where: {
        projectId,
        dueDate: { lt: now },
        status: { not: 'DONE' },
      },
      orderBy: { dueDate: 'asc' },
      include: {
        reporter: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
    }),
    prisma.activityLog.findMany({
      where: {
        OR: [
          { entityType: 'PROJECT', entityId: projectId },
          { entityType: 'ISSUE', entityId: { in: issueIds } },
          { entityType: 'COMMENT', entityId: { in: issueIds } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { id: true, name: true } },
      },
    }),
  ]);

  // Normalize status distribution
  const statusMap = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
  statusCounts.forEach((item) => {
    if (statusMap[item.status] !== undefined) {
      statusMap[item.status] = item._count._all;
    }
  });

  // Normalize priority distribution
  const priorityMap = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  priorityCounts.forEach((item) => {
    if (priorityMap[item.priority] !== undefined) {
      priorityMap[item.priority] = item._count._all;
    }
  });

  const doneCount = statusMap.DONE;
  const completionRate = totalIssues === 0 ? 0 : Math.round((doneCount / totalIssues) * 100 * 100) / 100;

  return {
    project: {
      id: project.id,
      name: project.title,
      description: project.description || '',
    },
    stats: {
      totalIssues,
      todo: statusMap.TODO,
      inProgress: statusMap.IN_PROGRESS,
      done: statusMap.DONE,
      completion: completionRate,
    },
    priority: {
      critical: priorityMap.CRITICAL,
      high: priorityMap.HIGH,
      medium: priorityMap.MEDIUM,
      low: priorityMap.LOW,
    },
    recentIssues,
    overdueIssues,
    recentActivity,
  };
}

module.exports = {
  getProjectDashboard,
};
