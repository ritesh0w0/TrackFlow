const prisma = require('../config/prismaClient');

async function createProject(userId, data) {
  return await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        title: data.title,
        description: data.description,
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

    return project;
  });
}

async function getMyProjects(userId) {
  return await prisma.project.findMany({
    where: {
      members: {
        some: {
          userId: userId,
        },
      },
    },
  });
}

async function getProjectById(userId, projectId) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: true,
    }
  });

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  const isMember = project.members.some(member => member.userId === userId);
  if (!isMember) {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    throw error;
  }

  return project;
}

async function updateProject(userId, projectId, data) {
  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: userId,
        projectId: projectId,
      },
    },
  });

  if (!member || member.role !== 'OWNER') {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    throw error;
  }

  return await prisma.project.update({
    where: { id: projectId },
    data: {
      title: data.title,
      description: data.description,
    },
  });
}

async function deleteProject(userId, projectId) {
  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: userId,
        projectId: projectId,
      },
    },
  });

  if (!member || member.role !== 'OWNER') {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    throw error;
  }

  return await prisma.project.delete({
    where: { id: projectId },
  });
}

module.exports = {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
