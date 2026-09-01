const prisma = require('../config/prismaClient');
const logActivity = require('../utils/activityLogger');

/**
 * Create a new project and add the creator as OWNER.
 */
async function createProject(userId, data) {
  return await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        title: data.title.trim(),
        description: data.description ? data.description.trim() : null,
        createdById: userId,
      },
    });

    await tx.projectMember.create({
      data: {
        userId: userId,
        projectId: project.id,
        role: 'OWNER',
      },
    });

    await logActivity(
      {
        userId,
        action: 'PROJECT_CREATED',
        entityType: 'PROJECT',
        entityId: project.id,
        projectId: project.id,
        metadata: { title: project.title },
      },
      tx
    );

    return project;
  });
}

/**
 * Get all projects where the user is a member.
 */
async function getMyProjects(userId) {
  const projects = await prisma.project.findMany({
    where: {
      members: {
        some: {
          userId: userId,
        },
      },
    },
    include: {
      members: {
        select: {
          id: true,
          role: true,
          userId: true,
        },
      },
      _count: {
        select: {
          issues: true,
          members: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return projects.map((project) => {
    const userMembership = project.members.find((m) => m.userId === userId);
    return {
      ...project,
      currentUserRole: userMembership?.role || 'MEMBER',
    };
  });
}

/**
 * Get single project by ID with members list.
 */
async function getProjectById(userId, projectId) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { joinedAt: 'asc' },
      },
      _count: {
        select: {
          issues: true,
          members: true,
        },
      },
    },
  });

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  const membership = project.members.find((m) => m.userId === userId);
  if (!membership) {
    const error = new Error('Forbidden: You are not a member of this project');
    error.statusCode = 403;
    throw error;
  }

  return {
    ...project,
    currentUserRole: membership.role,
  };
}

/**
 * Update project details (restricted to OWNER or ADMIN).
 */
async function updateProject(userId, projectId, data) {
  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });

  if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
    const error = new Error('Forbidden: Only project OWNER or ADMIN can update project settings');
    error.statusCode = 403;
    throw error;
  }

  const updatedProject = await prisma.$transaction(async (tx) => {
    const project = await tx.project.update({
      where: { id: projectId },
      data: {
        title: data.title !== undefined ? data.title.trim() : undefined,
        description: data.description !== undefined ? (data.description ? data.description.trim() : null) : undefined,
      },
    });

    await logActivity(
      {
        userId,
        action: 'PROJECT_UPDATED',
        entityType: 'PROJECT',
        entityId: projectId,
        projectId,
        metadata: { title: project.title },
      },
      tx
    );

    return project;
  });

  return updatedProject;
}

/**
 * Delete project (restricted to OWNER only).
 */
async function deleteProject(userId, projectId) {
  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });

  if (!member || member.role !== 'OWNER') {
    const error = new Error('Forbidden: Only the project OWNER can delete this project');
    error.statusCode = 403;
    throw error;
  }

  await prisma.project.delete({
    where: { id: projectId },
  });
}

/**
 * Get all members of a project.
 */
async function getProjectMembers(userId, projectId) {
  const isMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });

  if (!isMember) {
    const error = new Error('Forbidden: You are not a member of this project');
    error.statusCode = 403;
    throw error;
  }

  return await prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { joinedAt: 'asc' },
  });
}

/**
 * Add a member to a project by user email.
 */
async function addProjectMember(userId, projectId, { email, role = 'MEMBER' }) {
  const requesterMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });

  if (!requesterMember || (requesterMember.role !== 'OWNER' && requesterMember.role !== 'ADMIN')) {
    const error = new Error('Forbidden: Only project OWNER or ADMIN can add team members');
    error.statusCode = 403;
    throw error;
  }

  const targetUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!targetUser) {
    const error = new Error(`No user found with email "${email}". Please ensure they have created a TrackFlow account first.`);
    error.statusCode = 404;
    throw error;
  }

  const existingMembership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: targetUser.id,
        projectId,
      },
    },
  });

  if (existingMembership) {
    const error = new Error('This user is already a member of this project');
    error.statusCode = 400;
    throw error;
  }

  const newMember = await prisma.$transaction(async (tx) => {
    const member = await tx.projectMember.create({
      data: {
        userId: targetUser.id,
        projectId,
        role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await logActivity(
      {
        userId,
        action: 'MEMBER_ADDED',
        entityType: 'MEMBER',
        entityId: member.id,
        projectId,
        metadata: { memberName: targetUser.name, role },
      },
      tx
    );

    return member;
  });

  return newMember;
}

/**
 * Update a project member's role.
 */
async function updateProjectMemberRole(userId, projectId, memberId, { role }) {
  const requesterMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });

  if (!requesterMember || (requesterMember.role !== 'OWNER' && requesterMember.role !== 'ADMIN')) {
    const error = new Error('Forbidden: Only project OWNER or ADMIN can update member roles');
    error.statusCode = 403;
    throw error;
  }

  const targetMember = await prisma.projectMember.findUnique({
    where: { id: memberId },
    include: { user: { select: { name: true } } },
  });

  if (!targetMember || targetMember.projectId !== projectId) {
    const error = new Error('Project member not found');
    error.statusCode = 404;
    throw error;
  }

  if (targetMember.role === 'OWNER' && requesterMember.role !== 'OWNER') {
    const error = new Error('Forbidden: Only the project OWNER can transfer ownership');
    error.statusCode = 403;
    throw error;
  }

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.projectMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await logActivity(
      {
        userId,
        action: 'MEMBER_ROLE_UPDATED',
        entityType: 'MEMBER',
        entityId: memberId,
        projectId,
        metadata: { memberName: targetMember.user.name, from: targetMember.role, to: role },
      },
      tx
    );

    return updated;
  });
}

/**
 * Remove a member from a project.
 */
async function removeProjectMember(userId, projectId, memberId) {
  const requesterMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });

  if (!requesterMember) {
    const error = new Error('Forbidden: You are not a member of this project');
    error.statusCode = 403;
    throw error;
  }

  const targetMember = await prisma.projectMember.findUnique({
    where: { id: memberId },
    include: { user: { select: { name: true } } },
  });

  if (!targetMember || targetMember.projectId !== projectId) {
    const error = new Error('Project member not found');
    error.statusCode = 404;
    throw error;
  }

  // Allow self-removal or OWNER/ADMIN removal
  const isSelf = targetMember.userId === userId;
  const isPrivileged = requesterMember.role === 'OWNER' || requesterMember.role === 'ADMIN';

  if (!isSelf && !isPrivileged) {
    const error = new Error('Forbidden: Insufficient permissions to remove this member');
    error.statusCode = 403;
    throw error;
  }

  if (targetMember.role === 'OWNER') {
    const error = new Error('The project OWNER cannot be removed from the project');
    error.statusCode = 400;
    throw error;
  }

  await prisma.$transaction(async (tx) => {
    await logActivity(
      {
        userId,
        action: 'MEMBER_REMOVED',
        entityType: 'MEMBER',
        entityId: memberId,
        projectId,
        metadata: { memberName: targetMember.user.name },
      },
      tx
    );

    // Unassign issues assigned to this member in this project
    await tx.issue.updateMany({
      where: {
        projectId,
        assigneeId: targetMember.userId,
      },
      data: {
        assigneeId: null,
      },
    });

    await tx.projectMember.delete({
      where: { id: memberId },
    });
  });
}

module.exports = {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  updateProjectMemberRole,
  removeProjectMember,
};
