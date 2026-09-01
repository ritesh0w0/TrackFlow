const { z } = require('zod');

const VALID_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const createIssueSchema = z.object({
  title: z.string().trim().min(1, { message: 'Title is required' }).max(200),
  description: z.string().max(5000).optional().nullable().or(z.literal('')),
  priority: z.enum(VALID_PRIORITIES).default('MEDIUM'),
  dueDate: z.string().datetime({ offset: true }).optional().nullable().or(z.literal('')).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  tags: z.array(z.string().trim().max(30)).optional().default([]),
});

const updateIssueSchema = z.object({
  title: z.string().trim().min(1, { message: 'Title cannot be empty' }).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  priority: z.enum(VALID_PRIORITIES).optional(),
  dueDate: z.string().optional().nullable(),
  tags: z.array(z.string().trim().max(30)).optional(),
});

const assignIssueSchema = z.object({
  assigneeId: z.string().uuid({ message: 'Invalid assignee user ID' }).optional().nullable(),
});

const updateStatusSchema = z.object({
  status: z.enum(VALID_STATUSES, { message: 'Invalid status. Allowed values: TODO, IN_PROGRESS, DONE' }),
});

const updatePrioritySchema = z.object({
  priority: z.enum(VALID_PRIORITIES, { message: 'Invalid priority. Allowed values: LOW, MEDIUM, HIGH, CRITICAL' }),
});

module.exports = {
  VALID_STATUSES,
  VALID_PRIORITIES,
  createIssueSchema,
  updateIssueSchema,
  assignIssueSchema,
  updateStatusSchema,
  updatePrioritySchema,
};
