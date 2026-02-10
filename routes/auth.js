const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

module.exports = (db) => {
  const router = express.Router();
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  /**
   * POST /api/auth/google
   * Authenticate user with Google ID token
   * 
   * Request body:
   * {
   *   "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjI4YT..."
   * }
   * 
   * Response:
   * {
   *   "success": true,
   *   "token": "your_backend_jwt_token",
   *   "user": { id, email, name, picture }
   * }
   */
  router.post('/google', async (req, res) => {
    try {
      const { idToken } = req.body;

      // Validate request
      if (!idToken) {
        return res.status(400).json({
          success: false,
          error: 'ID token is required'
        });
      }

      // Verify the Google ID token
      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      
      const payload = ticket.getPayload();
      const { sub: googleId, email, name, picture } = payload;

      // Validate essential fields
      if (!googleId || !email) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token payload'
        });
      }

      // Find existing user by Google ID
      let users = db.findAll('users');
      let user = users.find(u => u.googleId === googleId);
      
      if (!user) {
        // Check if user exists with this email (link accounts)
        user = users.find(u => u.email === email);
        
        if (user) {
          // Update existing user with Google ID
          user = db.update('users', user.id, {
            googleId,
            name,
            picture,
            updatedAt: new Date().toISOString()
          });
        } else {
          // Create new user
          user = db.insert('users', {
            googleId,
            email,
            name,
            picture,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      } else {
        // Update existing user's info
        user = db.update('users', user.id, {
          name,
          picture,
          updatedAt: new Date().toISOString()
        });
      }

      if (!user) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create or update user'
        });
      }

      // Generate JWT token for your application
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Return success response
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture
        }
      });

    } catch (error) {
      console.error('Google Sign-In Error:', error);
      
      // Differentiate between invalid token and server errors
      if (error.message && error.message.includes('Token')) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Authentication failed'
      });
    }
  });

  /**
   * GET /api/auth/verify
   * Verify JWT token validity
   * Protected route to test authentication
   */
  router.get('/verify', require('../middleware/auth')(db), (req, res) => {
    // If we reach here, token is valid (middleware verified it)
    res.json({
      success: true,
      user: req.user
    });
  });

  /**
   * POST /api/auth/logout
   * Logout endpoint (client-side token removal is primary method)
   * Optional: Could implement token blacklisting with Redis
   */
  router.post('/logout', require('../middleware/auth')(db), (req, res) => {
    // In a JWT-based system, logout is primarily handled client-side
    // by removing the token. This endpoint confirms the action.
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });

  return router;
};
