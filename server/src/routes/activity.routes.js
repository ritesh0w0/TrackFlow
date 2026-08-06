const express = require('express');
const { getProjectActivityController } = require('../controllers/activity.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/projects/:id/activity', getProjectActivityController);

module.exports = router;
