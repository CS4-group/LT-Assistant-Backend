const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { Resend } = require('resend');
const rateLimit = require('express-rate-limit');
const requireAuth = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();
  const resend = new Resend(process.env.RESEND_API_KEY);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later' }
  });
  router.use(authLimiter);

  const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  };

  function sanitizeUser(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      goals: user.goals || null,
      coursePlan: user.coursePlan || null
    };
  }

  // POST /api/auth/signup
  router.post('/signup',
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/(?=.*[a-zA-Z])(?=.*[0-9])/),
    body('name').trim().notEmpty(),
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ success: false, message: 'Invalid email, password, or name format' });
        }

        const { email, password, name } = req.body;

        const existing = await db.find('users', { email });
        if (existing.length > 0) {
          return res.status(201).json({ success: true, message: 'Please check your email to confirm your account.' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const confirmationToken = crypto.randomBytes(32).toString('hex');
        const confirmationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await db.insert('users', {
          email,
          name,
          password: hashedPassword,
          isConfirmed: false,
          confirmationToken,
          confirmationTokenExpiry: confirmationTokenExpiry.toISOString(),
          goals: null,
          coursePlan: null,
          createdAt: new Date().toISOString()
        });

        try {
          await resend.emails.send({
            from: 'noreply@ltassistant.com',
            to: email,
            subject: 'Confirm your LT Assistant account',
            html: `<p>Click <a href="https://ltassistant.com/confirm/${confirmationToken}">here</a> to confirm your account. This link expires in 24 hours.</p>`
          });
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
        }

        res.status(201).json({ success: true, message: 'Please check your email to confirm your account.' });
      } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
      }
    }
  );

  // GET /api/auth/confirm/:token
  router.get('/confirm/:token', async (req, res) => {
    try {
      const { token } = req.params;

      const users = await db.find('users', { confirmationToken: token });
      if (users.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid or expired confirmation link' });
      }

      const user = users[0];
      if (new Date() > new Date(user.confirmationTokenExpiry)) {
        return res.status(400).json({ success: false, message: 'Invalid or expired confirmation link' });
      }

      await db.update('users', user.id, {
        isConfirmed: true,
        confirmationToken: null,
        confirmationTokenExpiry: null
      });

      res.json({ success: true, message: 'Email confirmed successfully. You can now log in.' });
    } catch (error) {
      console.error('Confirmation error:', error);
      res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
    }
  });

  // POST /api/auth/resend-confirmation
  router.post('/resend-confirmation',
    body('email').isEmail().normalizeEmail(),
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        const { email } = req.body;
        const users = await db.find('users', { email });

        if (users.length > 0 && !users[0].isConfirmed) {
          const confirmationToken = crypto.randomBytes(32).toString('hex');
          const confirmationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

          await db.update('users', users[0].id, {
            confirmationToken,
            confirmationTokenExpiry: confirmationTokenExpiry.toISOString()
          });

          try {
            await resend.emails.send({
              from: 'noreply@ltassistant.com',
              to: email,
              subject: 'Confirm your LT Assistant account',
              html: `<p>Click <a href="https://ltassistant.com/confirm/${confirmationToken}">here</a> to confirm your account. This link expires in 24 hours.</p>`
            });
          } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
          }
        }

        res.json({ success: true, message: 'If an account exists and is unconfirmed, a new confirmation email has been sent.' });
      } catch (error) {
        console.error('Resend confirmation error:', error);
        res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
      }
    }
  );

  // POST /api/auth/login
  router.post('/login',
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const { email, password } = req.body;

        const users = await db.find('users', { email });
        if (users.length === 0) {
          return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = users[0];

        if (!user.isConfirmed) {
          return res.status(403).json({ success: false, message: 'Please confirm your email before logging in' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const jwtToken = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.cookie('token', jwtToken, COOKIE_OPTIONS);
        res.json({
          success: true,
          message: 'Logged in successfully',
          user: sanitizeUser(user)
        });
      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
      }
    }
  );

  // POST /api/auth/logout
  router.post('/logout', (req, res) => {
    res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'strict' });
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // GET /api/auth/me
  router.get('/me', requireAuth(db), async (req, res) => {
    try {
      const user = await db.findById('users', req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({ success: true, user: sanitizeUser(user) });
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
    }
  });

  return router;
};
