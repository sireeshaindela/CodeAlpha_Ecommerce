const User = require('../models/User');

/**
 * Authentication middleware that verifies session existence
 * and binds the authenticated User object to req.user.
 */
async function requireAuth(req, res, next) {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      // Session exists but user was removed from database
      req.session.destroy(() => {});
      return res.status(401).json({
        success: false,
        message: 'Session invalid or user account no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = requireAuth;
