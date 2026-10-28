/**
 * Authorization middleware ensuring the authenticated user possesses the 'admin' role.
 * Must be preceded by requireAuth in route definitions.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.'
    });
  }
  next();
}

module.exports = requireAdmin;
