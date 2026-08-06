const activityService = require('../services/activity.service');

async function getProjectActivityController(req, res) {
  try {
    const activities = await activityService.getProjectActivity(req.user.id, req.params.id);
    return res.status(200).json({
      success: true,
      data: activities,
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
  getProjectActivityController,
};
