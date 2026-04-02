const jwt = require('jsonwebtoken');

function requireAuth(db) {
  return async (req, res, next) => {
    try {
      const token = req.cookies?.token;

      if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await db.findById('users', decoded.userId);

      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      if (!user.isConfirmed) {
        return res.status(403).json({ success: false, message: 'Please confirm your email address' });
      }

      req.user = { id: user.id, email: user.email, name: user.name };
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
  };
}

module.exports = requireAuth;
