const User = require('../models/User');

/**
 * Register a new customer
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { name, email, password, phone, shippingAddress } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already registered
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    // Create user (password is automatically hashed via pre-save hook)
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone ? phone.trim() : undefined,
      shippingAddress: shippingAddress || {}
    });

    await user.save();

    // Establish authenticated server-side session
    req.session.userId = user._id;
    req.session.role = user.role;

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to ShopEasy.',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Log in an existing user
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Find user including password field for verification
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Establish authenticated server-side session
    req.session.userId = user._id;
    req.session.role = user.role;

    res.status(200).json({
      success: true,
      message: 'Login successful! Welcome back.',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Log out the current user and destroy server session
 * POST /api/auth/logout
 */
function logout(req, res, next) {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie('connect.sid');
      return res.status(200).json({
        success: true,
        message: 'You have been successfully logged out.'
      });
    });
  } else {
    res.status(200).json({
      success: true,
      message: 'Already logged out.'
    });
  }
}

/**
 * Get current authenticated user's session profile
 * GET /api/auth/me
 */
async function getCurrentUser(req, res, next) {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated.'
      });
    }

    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({
        success: false,
        message: 'User session not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  getCurrentUser
};
