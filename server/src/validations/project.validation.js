const { z } = require('zod');

const createProjectSchema = z.object({
  title: z.string().trim().min(1, { message: 'Project title is required' }).max(100),
  description: z.string().trim().max(1000).optional().nullable(),
});

const updateProjectSchema = z.object({
  title: z.string().trim().min(1, { message: 'Project title cannot be empty' }).max(100).optional(),
  description: z.string().trim().max(1000).optional().nullable(),
});

const addMemberSchema = z.object({
  email: z.string().trim().email({ message: 'Valid user email is required' }),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
});

const updateMemberRoleSchema = z.object({
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER'], { message: 'Role must be OWNER, ADMIN, or MEMBER' }),
});

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  updateMemberRoleSchema,
};
