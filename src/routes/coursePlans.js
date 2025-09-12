const express = require('express');
const router = express.Router();
const { coursePlanService } = require('../services');

/**
 * CoursePlan Routes - For managing 4-year academic plans
 */

/**
 * @route   POST /api/v1/course-plans
 * @desc    Create a new course plan
 */
router.post('/', async (req, res) => {
  try {
    const coursePlan = await coursePlanService.createCoursePlan(req.body);
    res.status(201).json({
      success: true,
      data: coursePlan,
      message: 'Course plan created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/course-plans/:id
 * @desc    Get course plan by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const coursePlan = await coursePlanService.getCoursePlanById(req.params.id);
    res.json({
      success: true,
      data: coursePlan,
      message: 'Course plan retrieved successfully'
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/course-plans/student/:studentId
 * @desc    Get course plan by student ID
 */
router.get('/student/:studentId', async (req, res) => {
  try {
    const coursePlan = await coursePlanService.getCoursePlanByStudent(req.params.studentId);
    res.json({
      success: true,
      data: coursePlan,
      message: 'Course plan retrieved successfully'
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/v1/course-plans/student/:studentId
 * @desc    Update course plan
 */
router.put('/student/:studentId', async (req, res) => {
  try {
    const coursePlan = await coursePlanService.updateCoursePlan(req.params.studentId, req.body);
    res.json({
      success: true,
      data: coursePlan,
      message: 'Course plan updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   DELETE /api/v1/course-plans/student/:studentId
 * @desc    Delete course plan
 */
router.delete('/student/:studentId', async (req, res) => {
  try {
    await coursePlanService.deleteCoursePlan(req.params.studentId);
    res.json({
      success: true,
      message: 'Course plan deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
