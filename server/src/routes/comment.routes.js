const express = require('express');
const {
  createCommentController,
  getCommentsController,
  updateCommentController,
  deleteCommentController,
} = require('../controllers/comment.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

// Issue-scoped comment routes
router.post('/issues/:id/comments', createCommentController);
router.get('/issues/:id/comments', getCommentsController);

// Comment-scoped routes
router.patch('/comments/:id', updateCommentController);
router.delete('/comments/:id', deleteCommentController);

module.exports = router;
