const express = require('express');
const router = express.Router();
const { reviewService } = require('../services');

/**
 * Review Routes - For managing course/teacher/club reviews
 */

/**
 * @route   POST /api/v1/reviews
 * @desc    Create a new review
 */
router.post('/', async (req, res) => {
  try {
    const review = await reviewService.createReview(req.body);
    res.status(201).json({
      success: true,
      data: review,
      message: 'Review created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/reviews
 * @desc    Get all reviews
 */
router.get('/', async (req, res) => {
  try {
    const reviews = await reviewService.getAllReviews();
    res.json({
      success: true,
      data: reviews,
      message: 'Reviews retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/reviews/:id
 * @desc    Get review by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const review = await reviewService.getReviewById(req.params.id);
    res.json({
      success: true,
      data: review,
      message: 'Review retrieved successfully'
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/reviews/:type/:targetId
 * @desc    Get reviews by target (course/teacher/club)
 */
router.get('/:type/:targetId', async (req, res) => {
  try {
    const reviews = await reviewService.getReviewsByTarget(req.params.type, req.params.targetId);
    res.json({
      success: true,
      data: reviews,
      message: 'Reviews retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/v1/reviews/:id
 * @desc    Update review
 */
router.put('/:id', async (req, res) => {
  try {
    const review = await reviewService.updateReview(req.params.id, req.body);
    res.json({
      success: true,
      data: review,
      message: 'Review updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   DELETE /api/v1/reviews/:id
 * @desc    Delete review
 */
router.delete('/:id', async (req, res) => {
  try {
    await reviewService.deleteReview(req.params.id);
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
