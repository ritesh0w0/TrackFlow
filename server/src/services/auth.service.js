const prisma = require('../config/prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
const JWT_EXPIRES_IN = '7d';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
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
  const [user, projects, assignedOpenIssuesCount, assignedDoneIssuesCount] =
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
      prisma.issue.count({
        where: {
          assigneeId: userId,
          status: { in: ['TODO', 'IN_PROGRESS'] },
        },
      }),
      prisma.issue.count({
        where: {
          assigneeId: userId,
          status: 'DONE',
        },
      }),
    ]);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return {
    ...user,
    stats: {
      projectsJoined: user._count.projectMembers,
      issuesReported: user._count.reportedIssues,
      assignedOpenIssues: assignedOpenIssuesCount,
      assignedCompletedIssues: assignedDoneIssuesCount,
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