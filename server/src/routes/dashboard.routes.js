const express = require('express');
const { getDashboardController } = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/projects/:projectId/dashboard', getDashboardController);

module.exports = router;
