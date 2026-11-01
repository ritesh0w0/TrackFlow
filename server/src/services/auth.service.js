const prisma = require('../config/prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/jwt');

const JWT_EXPIRES_IN = '7d';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN }
  );
}

async function signupService(data) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (existingUser) {
    const error = new Error('Email already exists');
    error.statusCode = 400;
    throw error;
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(data.password, saltRounds);

  const user = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email: data.email.toLowerCase(),
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const token = generateToken(user);
  return { token, user };
}

async function loginService(data) {
  const user = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 400;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 400;
    throw error;
  }

  const sanitizedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };

  const token = generateToken(sanitizedUser);
  return { token, user: sanitizedUser };
}

async function getMeService(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          projectMembers: true,
          reportedIssues: true,
          assignedIssues: true,
          comments: true,
        },
      },
    },
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
}

async function getUserProfileWithStatsService(userId) {
  const [user, projects, assignedIssueGroups] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              projectMembers: true,
              reportedIssues: true,
              assignedIssues: true,
              comments: true,
            },
          },
        },
      }),
      prisma.projectMember.findMany({
        where: { userId },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              description: true,
              createdAt: true,
            },
          },
        },
        orderBy: { joinedAt: 'desc' },
      }),
      // Single consolidated groupBy query replaces two separate count queries
      prisma.issue.groupBy({
        by: ['status'],
        where: { assigneeId: userId },
        _count: { _all: true },
      }),
    ]);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  let assignedOpenIssues = 0;
  let assignedCompletedIssues = 0;
  assignedIssueGroups.forEach((g) => {
    if (g.status === 'DONE') {
      assignedCompletedIssues += g._count._all;
    } else {
      assignedOpenIssues += g._count._all;
    }
  });

  return {
    ...user,
    stats: {
      projectsJoined: user._count.projectMembers,
      issuesReported: user._count.reportedIssues,
      assignedOpenIssues,
      assignedCompletedIssues,
      totalComments: user._count.comments,
    },
    projects: projects.map((pm) => ({
      id: pm.project.id,
      title: pm.project.title,
      description: pm.project.description,
      role: pm.role,
      joinedAt: pm.joinedAt,
    })),
  };
}

async function updateUserProfileService(userId, data) {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name.trim(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
}

module.exports = {
  signupService,
  loginService,
  getMeService,
  getUserProfileWithStatsService,
  updateUserProfileService,
};