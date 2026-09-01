const prisma = require('../config/prismaClient');
const { verifyProjectMember } = require('./issue.service');

/**
 * Get project intelligence dashboard analytics and stats.
 * Executes independent aggregation queries concurrently using Promise.all().
 */
async function getProjectDashboard(userId, projectId) {
  await verifyProjectMember(projectId, userId);

  const now = new Date();
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [
    project,
    totalIssues,
    statusCounts,
    priorityCounts,
    recentIssues,
    overdueIssues,
    staleIssuesCount,
    resolvedIssues,
    projectMembers,
    assignedIssueCounts,
    recentActivity,
  ] = await Promise.all([
    // Project info & member count
    prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        _count: { select: { members: true } },
      },
    }),

    // Total issues
    prisma.issue.count({
      where: { projectId },
    }),

    // Status breakdown
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

    // Recent 5 issues
    prisma.issue.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    }),

    // Overdue issues
    prisma.issue.findMany({
      where: {
        projectId,
        dueDate: { lt: now },
        status: { not: 'DONE' },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
      include: {
        reporter: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
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

    // Project members for workload mapping
    prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
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
      include: {
        user: { select: { id: true, name: true } },
      },
    }),
  ]);

  // Normalize status counts
  const statusMap = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
  statusCounts.forEach((item) => {
    if (statusMap[item.status] !== undefined) {
      statusMap[item.status] = item._count._all;
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
  projectMembers.forEach((member) => {
    memberWorkloadMap.set(member.userId, {
      userId: member.userId,
      name: member.user.name,
      email: member.user.email,
      role: member.role,
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
      membersCount: project._count.members,
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
      overdueCount: overdueIssues.length,
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
    overdueIssues,
    recentActivity,
  };
}

module.exports = {
  getProjectDashboard,
};
