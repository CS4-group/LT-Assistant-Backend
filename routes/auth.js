const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

module.exports = (db) => {
  const router = express.Router();
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  /**
   * POST /api/auth/google
   * Authenticate user with Google ID token
   * Returns isNewUser: true if the account was just created
   */
  router.post('/google', async (req, res) => {
    try {
      const { idToken } = req.body;

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

      if (!googleId || !email) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token payload'
        });
      }

      // Find or create user — track whether this is a new account
      let isNewUser = false;
      let users = await db.findAll('users');
      let user = users.find(u => u.googleId === googleId);

      if (!user) {
        // Check if user exists with this email (link accounts)
        user = users.find(u => u.email === email);

        if (user) {
          // Link existing email account to Google ID
          user = await db.update('users', user.id, {
            googleId,
            name,
            picture,
            updatedAt: new Date().toISOString()
          });
        } else {
          // Brand new user
          isNewUser = true;
          user = await db.insert('users', {
            googleId,
            email,
            name,
            picture,
            goals: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      } else {
        // Returning user — update name/picture in case they changed
        user = await db.update('users', user.id, {
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

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        token,
        isNewUser,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          goals: user.goals || null
        }
      });

    } catch (error) {
      console.error('Google Sign-In Error:', error);

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
   */
  router.get('/verify', require('../middleware/auth')(db), (req, res) => {
    res.json({
      success: true,
      user: req.user
    });
  });

  /**
   * POST /api/auth/logout
   */
  router.post('/logout', require('../middleware/auth')(db), (req, res) => {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });

  return router;
};
