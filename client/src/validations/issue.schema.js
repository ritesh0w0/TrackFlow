import { z } from 'zod';

export const issueSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),
  description: z
    .string()
    .max(5000, 'Description must be 5000 characters or less')
    .optional()
    .nullable()
    .or(z.literal('')),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  dueDate: z
    .string()
    .optional()
    .nullable()
    .or(z.literal('')),
  tags: z
    .string()
    .optional()
    .or(z.array(z.string())),
  assigneeId: z
    .string()
    .optional()
    .nullable()
    .or(z.literal('')),
});
