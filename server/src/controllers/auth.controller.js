const {
  signupService,
  loginService,
  getMeService,
  getUserProfileWithStatsService,
  updateUserProfileService,
} = require('../services/auth.service');
const {
  signupSchema,
  loginSchema,
  updateProfileSchema,
} = require('../validations/auth.validation');

async function signupController(req, res, next) {
  try {
    const validatedData = signupSchema.parse(req.body);
    const result = await signupService(validatedData);

    // Set cookie on signup for seamless auth
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    if (error.name === 'ZodError' || error.issues) {
      return res.status(400).json({
        success: false,
        message: error.issues?.[0]?.message || error.errors?.[0]?.message || 'Validation error',
        errors: error.issues || error.errors,
      });
    }
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Signup failed',
    });
  }
}

async function loginController(req, res, next) {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await loginService(validatedData);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: result.token,
      user: result.user,
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
      message: error.message || 'Invalid credentials',
    });
  }
}

async function getMeController(req, res, next) {
  try {
    const user = await getMeService(req.user.id);
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(error.statusCode || 401).json({
      success: false,
      message: error.message || 'Unauthorized',
    });
  }
}

async function getProfileController(req, res, next) {
  try {
    const profile = await getUserProfileWithStatsService(req.user.id);
    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Failed to fetch user profile',
    });
  }
}

async function updateProfileController(req, res, next) {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    const updatedUser = await updateUserProfileService(req.user.id, validatedData);
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
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
      message: error.message || 'Failed to update profile',
    });
  }
}

async function logoutController(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}

module.exports = {
  signupController,
  loginController,
  getMeController,
  getProfileController,
  updateProfileController,
  logoutController,
};