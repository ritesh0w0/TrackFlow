const express = require('express');
const {
  createProjectController,
  getMyProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController,
} = require('../controllers/project.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createProjectController);
router.get('/', getMyProjectsController);
router.get('/:id', getProjectByIdController);
router.patch('/:id', updateProjectController);
router.delete('/:id', deleteProjectController);

module.exports = router;
