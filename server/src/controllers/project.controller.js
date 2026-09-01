const projectService = require('../services/project.service');
const {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  updateMemberRoleSchema,
} = require('../validations/project.validation');

async function createProjectController(req, res, next) {
  try {
    const validatedData = createProjectSchema.parse(req.body);
    const project = await projectService.createProject(req.user.id, validatedData);
    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  } catch (error) {
    if (error.name === 'ZodError' || error.issues) {
      return res.status(400).json({
        success: false,
        message: error.issues?.[0]?.message || error.errors?.[0]?.message || 'Validation error',
      });
    }
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Failed to create project',
    });
  }
}

async function getMyProjectsController(req, res, next) {
  try {
    const projects = await projectService.getMyProjects(req.user.id);
    return res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Failed to load projects',
    });
  }
}

async function getProjectByIdController(req, res, next) {
  try {
    const project = await projectService.getProjectById(req.user.id, req.params.id);
    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Failed to load project details',
    });
  }
}

async function updateProjectController(req, res, next) {
  try {
    const validatedData = updateProjectSchema.parse(req.body);
    const project = await projectService.updateProject(req.user.id, req.params.id, validatedData);
    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    if (error.name === 'ZodError' || error.issues) {
      return res.status(400).json({
        success: false,
        message: error.issues?.[0]?.message || error.errors?.[0]?.message || 'Validation error',
      });
    }
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Failed to update project',
    });
  }
}

async function deleteProjectController(req, res, next) {
  try {
    await projectService.deleteProject(req.user.id, req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Failed to delete project',
    });
  }
}

async function getProjectMembersController(req, res, next) {
  try {
    const members = await projectService.getProjectMembers(req.user.id, req.params.projectId);
    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Failed to load project members',
    });
  }
}

async function addProjectMemberController(req, res, next) {
  try {
    const validatedData = addMemberSchema.parse(req.body);
    const member = await projectService.addProjectMember(req.user.id, req.params.projectId, validatedData);
    return res.status(201).json({
      success: true,
      message: 'Member added to project',
      data: member,
    });
  } catch (error) {
    if (error.name === 'ZodError' || error.issues) {
      return res.status(400).json({
        success: false,
        message: error.issues?.[0]?.message || error.errors?.[0]?.message || 'Validation error',
      });
    }
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Failed to add member',
    });
  }
}

async function updateProjectMemberRoleController(req, res, next) {
  try {
    const validatedData = updateMemberRoleSchema.parse(req.body);
    const member = await projectService.updateProjectMemberRole(
      req.user.id,
      req.params.projectId,
      req.params.memberId,
      validatedData
    );
    return res.status(200).json({
      success: true,
      message: 'Member role updated successfully',
      data: member,
    });
  } catch (error) {
    if (error.name === 'ZodError' || error.issues) {
      return res.status(400).json({
        success: false,
        message: error.issues?.[0]?.message || error.errors?.[0]?.message || 'Validation error',
      });
    }
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Failed to update member role',
    });
  }
}

async function removeProjectMemberController(req, res, next) {
  try {
    await projectService.removeProjectMember(req.user.id, req.params.projectId, req.params.memberId);
    return res.status(200).json({
      success: true,
      message: 'Member removed from project',
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Failed to remove member',
    });
  }
}

module.exports = {
  createProjectController,
  getMyProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController,
  getProjectMembersController,
  addProjectMemberController,
  updateProjectMemberRoleController,
  removeProjectMemberController,
};
