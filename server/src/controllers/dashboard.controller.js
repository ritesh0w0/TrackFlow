const dashboardService = require('../services/dashboard.service');

async function getDashboardController(req, res) {
  try {
    const data = await dashboardService.getProjectDashboard(req.user.id, req.params.projectId);
    return res.status(200).json({
      success: true,
      data,
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
  getDashboardController,
};
