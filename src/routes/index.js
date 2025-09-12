/**
 * Routes index file - School project routing configuration
 */

const express = require('express');
const router = express.Router();

// Import route modules
const studentRoutes = require('./students');
const courseRoutes = require('./courses');
const reviewRoutes = require('./reviews');
const coursePlanRoutes = require('./coursePlans');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Course Rating & Planning System API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
router.use('/students', studentRoutes);
router.use('/courses', courseRoutes);
router.use('/reviews', reviewRoutes);
router.use('/course-plans', coursePlanRoutes);

// Root API endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Course Rating & Planning System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/health',
      students: '/api/v1/students',
      courses: '/api/v1/courses',
      reviews: '/api/v1/reviews',
      coursePlans: '/api/v1/course-plans'
    }
  });
});

module.exports = router;
