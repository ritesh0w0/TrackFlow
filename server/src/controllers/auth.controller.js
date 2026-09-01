const { signupService, loginService, getMeService } = require('../services/auth.service');

async function signupController(req, res) {
  try {
    const user = await signupService(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function loginController(req, res) {
  try {
    const result = await loginService(req.body);
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: 'Login successful', user: result.user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function getMeController(req, res) {
  try {
    const user = await getMeService(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
}

async function logoutController(req, res) {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
}

module.exports = {
  signupController,
  loginController,
  getMeController,
  logoutController,
};