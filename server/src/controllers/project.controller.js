const projectService = require('../services/project.service');

async function createProjectController(req, res) {
  try {
    const project = await projectService.createProject(req.user.id, req.body);
    res.status(201).json(project);
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
}

async function getMyProjectsController(req, res) {
  try {
    const projects = await projectService.getMyProjects(req.user.id);
    res.status(200).json(projects);
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
}

async function getProjectByIdController(req, res) {
  try {
    const project = await projectService.getProjectById(req.user.id, req.params.id);
    res.status(200).json(project);
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
}

async function updateProjectController(req, res) {
  try {
    const project = await projectService.updateProject(req.user.id, req.params.id, req.body);
    res.status(200).json(project);
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
}

async function deleteProjectController(req, res) {
  try {
    await projectService.deleteProject(req.user.id, req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
}

module.exports = {
  createProjectController,
  getMyProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController,
};
