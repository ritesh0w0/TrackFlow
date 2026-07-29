const { signupService, loginService } = require('../services/auth.service');

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
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = {
  signupController,
  loginController,
};