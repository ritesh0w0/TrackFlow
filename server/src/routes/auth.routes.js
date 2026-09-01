const express = require('express');
const {
  signupController,
  loginController,
  getMeController,
  logoutController,
} = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/signup', signupController);
router.post('/login', loginController);
router.get('/me', authMiddleware, getMeController);
router.post('/logout', logoutController);

module.exports = router;