const express = require('express');
const router = express.Router();
const { courseService } = require('../services');

/**
 * Course Routes - For managing courses
 */

/**
 * @route   POST /api/v1/courses
 * @desc    Create a new course
 */
router.post('/', async (req, res) => {
  try {
    const course = await courseService.createCourse(req.body);
    res.status(201).json({
      success: true,
      data: course,
      message: 'Course created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/courses
 * @desc    Get all courses
 */
router.get('/', async (req, res) => {
  try {
    const courses = await courseService.getAllCourses();
    res.json({
      success: true,
      data: courses,
      message: 'Courses retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/courses/course-ratings
 * @desc    Get courses for rating (title and description only)
 */
router.get('/course-ratings', async (req, res) => {
  try {
    const courses = await courseService.getCoursesForRating();
    res.json({
      success: true,
      data: courses,
      message: 'Courses for rating retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/courses/:id
 * @desc    Get course by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    res.json({
      success: true,
      data: course,
      message: 'Course retrieved successfully'
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/v1/courses/:id
 * @desc    Update course
 */
router.put('/:id', async (req, res) => {
  try {
    const course = await courseService.updateCourse(req.params.id, req.body);
    res.json({
      success: true,
      data: course,
      message: 'Course updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   DELETE /api/v1/courses/:id
 * @desc    Delete course
 */
router.delete('/:id', async (req, res) => {
  try {
    await courseService.deleteCourse(req.params.id);
    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
