const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // GET all reviews (optionally filter by entity)
  router.get('/', (req, res) => {
    try {
      const { entityType, entityId } = req.query;
      
      let reviews;
      if (entityType && entityId) {
        // Filter by specific entity
        reviews = db.find('reviews', { 
          entityType, 
          entityId: parseInt(entityId) 
        });
      } else if (entityType) {
        // Filter by entity type only
        reviews = db.find('reviews', { entityType });
      } else {
        // Get all reviews
        reviews = db.findAll('reviews');
      }

      res.json({
        success: true,
        data: reviews,
        message: 'Reviews retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving reviews',
        error: error.message
      });
    }
  });

  // GET a specific review
  router.get('/:id', (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const review = db.findById('reviews', reviewId);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      res.json({
        success: true,
        data: review,
        message: 'Review retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving review',
        error: error.message
      });
    }
  });

  // CREATE a new review
  router.post('/', (req, res) => {
    try {
      const { rating, text, entityType, entityId } = req.body;
      
      // Validate required fields
      if (!rating || !entityType || !entityId) {
        return res.status(400).json({
          success: false,
          message: 'Rating, entityType, and entityId are required'
        });
      }

      // Validate rating is between 1-5
      if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be an integer between 1 and 5'
        });
      }

      // Validate entity type
      const validEntityTypes = ['course', 'teacher', 'club'];
      if (!validEntityTypes.includes(entityType)) {
        return res.status(400).json({
          success: false,
          message: `Entity type must be one of: ${validEntityTypes.join(', ')}`
        });
      }

      // Verify the entity exists
      const entityCollection = entityType + 's'; // course -> courses
      const entity = db.findById(entityCollection, entityId);
      if (!entity) {
        return res.status(404).json({
          success: false,
          message: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} not found`
        });
      }

      // Text is optional - set to null if not provided
      const newReview = db.insert('reviews', { 
        rating,
        text: text || null,
        entityType,
        entityId,
        timestamp: new Date().toISOString()
      });
      
      if (!newReview) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create review'
        });
      }

      res.status(201).json({
        success: true,
        data: newReview,
        message: 'Review created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating review',
        error: error.message
      });
    }
  });

  // UPDATE a review
  router.put('/:id', (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const { rating, text } = req.body;
      
      const updates = {};
      
      // Validate rating if provided
      if (rating !== undefined) {
        if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
          return res.status(400).json({
            success: false,
            message: 'Rating must be an integer between 1 and 5'
          });
        }
        updates.rating = rating;
      }
      
      // Text can be updated or set to null
      if (text !== undefined) {
        updates.text = text || null;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one field (rating or text) is required for update'
        });
      }

      const updatedReview = db.update('reviews', reviewId, updates);
      
      if (!updatedReview) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      res.json({
        success: true,
        data: updatedReview,
        message: 'Review updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating review',
        error: error.message
      });
    }
  });

  // DELETE a review
  router.delete('/:id', (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const deleted = db.delete('reviews', reviewId);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      res.json({
        success: true,
        message: 'Review deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting review',
        error: error.message
      });
    }
  });

  return router;
};

