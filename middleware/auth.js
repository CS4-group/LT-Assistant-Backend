const jwt = require('jsonwebtoken');

/**
 * Required auth — rejects with 401 if no valid token present.
 * Usage: router.post('/route', authMiddleware(db), handler)
 */
function authMiddleware(db) {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({ success: false, error: 'No authorization token provided' });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({ success: false, error: 'Invalid authorization format. Use: Bearer <token>' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = db.findById('users', decoded.userId);

      if (!user) {
        return res.status(401).json({ success: false, error: 'User not found' });
      }

      req.user = { id: user.id, email: user.email, name: user.name, picture: user.picture };
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, error: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, error: 'Token expired' });
      }
      res.status(500).json({ success: false, error: 'Authentication failed' });
    }
  };
}

/**
 * Optional auth — attaches req.user if a valid token is present, otherwise continues.
 * Use for public endpoints that return bonus data for authenticated users.
 * Usage: router.get('/route', authMiddleware.optional(db), handler)
 */
authMiddleware.optional = (db) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return next();

      const token = authHeader.split(' ')[1];
      if (!token) return next();

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = db.findById('users', decoded.userId);
      if (user) {
        req.user = { id: user.id, email: user.email, name: user.name, picture: user.picture };
      }
    } catch (_) {
      // Invalid/expired token — continue as unauthenticated
    }
    next();
  };
};

module.exports = authMiddleware;
