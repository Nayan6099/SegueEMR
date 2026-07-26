const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

/**
 * Middleware to authenticate requests via JWT
 * Rejects with 401 if missing or invalid.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access Denied: No token provided'
    });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
      message: err.message
    });
  }
}

const requireAuth = authenticateToken;

/**
 * Middleware to authorize requests based on user roles
 * @param {...string} allowedRoles - permitted roles
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { role } = req.user;
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        error: 'Access Denied',
        message: `Role '${role}' is not authorized to perform this action`
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireAuth,
  requireRole,
};
