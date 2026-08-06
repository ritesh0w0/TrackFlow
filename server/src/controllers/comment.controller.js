const commentService = require('../services/comment.service');

async function createCommentController(req, res) {
  try {
    const comment = await commentService.createComment(req.user.id, req.params.id, req.body);
    return res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
}

async function getCommentsController(req, res) {
  try {
    const comments = await commentService.getComments(req.user.id, req.params.id);
    return res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
}

async function updateCommentController(req, res) {
  try {
    const comment = await commentService.updateComment(req.user.id, req.params.id, req.body);
    return res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
}

async function deleteCommentController(req, res) {
  try {
    await commentService.deleteComment(req.user.id, req.params.id);
    return res.status(200).json({
      success: true,
      data: { message: 'Comment deleted successfully' },
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
}

module.exports = {
  createCommentController,
  getCommentsController,
  updateCommentController,
  deleteCommentController,
};
