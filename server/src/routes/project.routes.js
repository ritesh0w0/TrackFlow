const express = require('express');
const {
  createProjectController,
  getMyProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController,
  getProjectMembersController,
  addProjectMemberController,
  updateProjectMemberRoleController,
  removeProjectMemberController,
} = require('../controllers/project.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

// Project CRUD
router.post('/', createProjectController);
router.get('/', getMyProjectsController);
router.get('/:id', getProjectByIdController);
router.patch('/:id', updateProjectController);
router.delete('/:id', deleteProjectController);

// Member Management
router.get('/:projectId/members', getProjectMembersController);
router.post('/:projectId/members', addProjectMemberController);
router.patch('/:projectId/members/:memberId', updateProjectMemberRoleController);
router.delete('/:projectId/members/:memberId', removeProjectMemberController);

module.exports = router;
