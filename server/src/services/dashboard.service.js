const prisma = require('../config/prismaClient');
const { verifyProjectMember } = require('./issue.service');

/**
 * Get project intelligence dashboard analytics and stats.
 * Executes independent aggregation queries concurrently using Promise.all().
 */
async function getProjectDashboard(userId, projectId) {
  // Single-query verification fast path that attaches project details
  const member = await verifyProjectMember(projectId, userId);
  const project = member.project;

  const now = new Date();
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [
    statusCounts,
    priorityCounts,
    recentIssues,
    overdueCount,
    staleIssuesCount,
    resolvedIssues,
    projectMembers,
    assignedIssueCounts,
    recentActivity,
  ] = await Promise.all([
    // Status breakdown (also derives totalIssues, openIssues, and completedIssues)
    prisma.issue.groupBy({
      by: ['status'],
      where: { projectId },
      _count: { _all: true },
    }),

    // Priority breakdown
    prisma.issue.groupBy({
      by: ['priority'],
      where: { projectId },
      _count: { _all: true },
    }),

    // Recent 5 issues (lean select omitting unnecessary relations)
    prisma.issue.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        projectId: true,
        createdAt: true,
        assignee: { select: { id: true, name: true } },
      },
    }),

    // Overdue count (lean indexed count instead of loading 10 heavy entities with joins)
    prisma.issue.count({
      where: {
        projectId,
        dueDate: { lt: now },
        status: { not: 'DONE' },
      },
    }),

    // Stale issues (>14 days without update & not DONE)
    prisma.issue.count({
      where: {
        projectId,
        status: { not: 'DONE' },
        updatedAt: { lt: fourteenDaysAgo },
      },
    }),

    // Resolved issues for average resolution time calculation
    prisma.issue.findMany({
      where: {
        projectId,
        status: 'DONE',
        resolvedAt: { not: null },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
      take: 100,
    }),

    // Project members for workload mapping (also provides exact membersCount)
    prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { joinedAt: 'asc' },
    }),

    // Workload breakdown: issues grouped by assignee & status
    prisma.issue.groupBy({
      by: ['assigneeId', 'status'],
      where: { projectId },
      _count: { _all: true },
    }),

    // Recent project activity
    prisma.activityLog.findMany({
      where: {
        OR: [
          { projectId: projectId },
          { entityType: 'PROJECT', entityId: projectId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        metadata: true,
        createdAt: true,
        user: { select: { id: true, name: true } },
      },
    }),
  ]);

  // Normalize status counts and calculate totals from groupBy
  const statusMap = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
  let totalIssues = 0;
  statusCounts.forEach((item) => {
    if (statusMap[item.status] !== undefined) {
      statusMap[item.status] = item._count._all;
      totalIssues += item._count._all;
    }
  });

  // Normalize priority counts
  const priorityMap = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  priorityCounts.forEach((item) => {
    if (priorityMap[item.priority] !== undefined) {
      priorityMap[item.priority] = item._count._all;
    }
  });

  const doneCount = statusMap.DONE;
  const openCount = statusMap.TODO + statusMap.IN_PROGRESS;
  const completionRate = totalIssues === 0 ? 0 : Math.round((doneCount / totalIssues) * 100);

  // Calculate Average Resolution Time (in hours)
  let averageResolutionHours = 0;
  if (resolvedIssues.length > 0) {
    const totalMs = resolvedIssues.reduce((acc, issue) => {
      const duration = new Date(issue.resolvedAt).getTime() - new Date(issue.createdAt).getTime();
      return acc + (duration > 0 ? duration : 0);
    }, 0);
    const avgMs = totalMs / resolvedIssues.length;
    averageResolutionHours = Math.round((avgMs / (1000 * 60 * 60)) * 10) / 10;
  }

  // Build Workload Distribution
  const memberWorkloadMap = new Map();

  // Initialize for all project members
  projectMembers.forEach((m) => {
    memberWorkloadMap.set(m.userId, {
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      openIssues: 0,
      completedIssues: 0,
      totalIssues: 0,
    });
  });

  // Track unassigned
  let unassignedCount = 0;

  assignedIssueCounts.forEach((group) => {
    const count = group._count._all;
    if (!group.assigneeId) {
      unassignedCount += count;
    } else if (memberWorkloadMap.has(group.assigneeId)) {
      const stats = memberWorkloadMap.get(group.assigneeId);
      if (group.status === 'DONE') {
        stats.completedIssues += count;
      } else {
        stats.openIssues += count;
      }
      stats.totalIssues += count;
    }
  });

  const workloadDistribution = Array.from(memberWorkloadMap.values());

  return {
    project: {
      id: project.id,
      name: project.title,
      description: project.description || '',
      membersCount: projectMembers.length,
      createdAt: project.createdAt,
    },
    stats: {
      totalIssues,
      openIssues: openCount,
      completedIssues: doneCount,
      todo: statusMap.TODO,
      inProgress: statusMap.IN_PROGRESS,
      done: statusMap.DONE,
      completion: completionRate,
      overdueCount,
      staleCount: staleIssuesCount,
      averageResolutionHours,
      unassignedCount,
    },
    priority: {
      critical: priorityMap.CRITICAL,
      high: priorityMap.HIGH,
      medium: priorityMap.MEDIUM,
      low: priorityMap.LOW,
    },
    workloadDistribution,
    recentIssues,
    overdueIssues: [],
    recentActivity,
  };
}

module.exports = {
  getProjectDashboard,
};
