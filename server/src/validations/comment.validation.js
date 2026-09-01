const { z } = require('zod');

const createCommentSchema = z.object({
  content: z.string().trim().min(1, { message: 'Content is required' }).max(1000, { message: 'Content must not exceed 1000 characters' }),
});

const updateCommentSchema = z.object({
  content: z.string().trim().min(1, { message: 'Content is required' }).max(1000, { message: 'Content must not exceed 1000 characters' }),
});

module.exports = {
  createCommentSchema,
  updateCommentSchema,
};
