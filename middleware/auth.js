const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request object
 * 
 * Usage:
 * const authMiddleware = require('./middleware/auth');
 * app.get('/api/protected', authMiddleware(db), (req, res) => {
 *   // Access req.user here
 * });
 */
module.exports = (db) => {
  return (req, res, next) => {
    try {
      // Get token from Authorization header
      // Expected format: "Bearer <token>"
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          error: 'No authorization token provided'
        });
      }

      const token = authHeader.split(' ')[1]; // Remove "Bearer " prefix
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Invalid authorization format. Use: Bearer <token>'
        });
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get full user details from database
      const user = db.findById('users', decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      // Attach user to request object
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture
      };

      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error);
      
      // Handle specific JWT errors
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Authentication failed'
      });
    }
  };
};
