const commentService = require('../services/comment.service');
const { createCommentSchema, updateCommentSchema } = require('../validations/comment.validation');

async function createCommentController(req, res, next) {
  try {
    const validatedData = createCommentSchema.parse(req.body);
    const comment = await commentService.createComment(req.user.id, req.params.id, validatedData);
    return res.status(201).json({
      success: true,
      message: 'Comment added',
      data: comment,
    });
  } catch (error) {
    if (error.name === 'ZodError' || error.issues) {
      return res.status(400).json({
        success: false,
        message: error.issues?.[0]?.message || error.errors?.[0]?.message || 'Validation error',
      });
    }
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to add comment',
    });
  }
}

async function getCommentsController(req, res, next) {
  try {
    const comments = await commentService.getComments(req.user.id, req.params.id);
    return res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to load comments',
    });
  }
}

async function updateCommentController(req, res, next) {
  try {
    const validatedData = updateCommentSchema.parse(req.body);
    const comment = await commentService.updateComment(req.user.id, req.params.id, validatedData);
    return res.status(200).json({
      success: true,
      message: 'Comment updated',
      data: comment,
    });
  } catch (error) {
    if (error.name === 'ZodError' || error.issues) {
      return res.status(400).json({
        success: false,
        message: error.issues?.[0]?.message || error.errors?.[0]?.message || 'Validation error',
      });
    }
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to update comment',
    });
  }
}

async function deleteCommentController(req, res, next) {
  try {
    await commentService.deleteComment(req.user.id, req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to delete comment',
    });
  }
}

module.exports = {
  createCommentController,
  getCommentsController,
  updateCommentController,
  deleteCommentController,
};
