const express = require('express');
const router = express.Router();

async function attachUserLiked(reviews, userId, db) {
  if (reviews.length === 0) return reviews;
  const reviewIds = reviews.map(r => r.id);
  const likes = await db.find('review_likes', { userId, reviewId: { $in: reviewIds } });
  const likedSet = new Set(likes.map(l => l.reviewId));
  return reviews.map(review => ({ ...review, userLiked: likedSet.has(review.id) }));
}

module.exports = (db) => {
  // GET all reviews (optionally filter by entity)
  router.get('/', async (req, res) => {
    try {
      const { entityType, entityId } = req.query;

      let reviews;
      if (entityType && entityId) {
        reviews = await db.find('reviews', { entityType, entityId: parseInt(entityId) });
      } else if (entityType) {
        reviews = await db.find('reviews', { entityType });
      } else {
        reviews = await db.findAll('reviews');
      }

      res.json({
        success: true,
        data: await attachUserLiked(reviews, req.user.id, db),
        message: 'Reviews retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error retrieving reviews', error: error.message });
    }
  });

  // GET a specific review
  router.get('/:id', async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const review = await db.findById('reviews', reviewId);

      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }

      const [enriched] = await attachUserLiked([review], req.user.id, db);
      res.json({ success: true, data: enriched, message: 'Review retrieved successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error retrieving review', error: error.message });
    }
  });

  // CREATE a new review (requires auth)
  router.post('/', async (req, res) => {
    try {
      const { rating, text, entityType, entityId } = req.body;

      if (!rating || !entityType || !entityId) {
        return res.status(400).json({ success: false, message: 'Rating, entityType, and entityId are required' });
      }

      if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5' });
      }

      const validEntityTypes = ['course', 'teacher', 'club'];
      if (!validEntityTypes.includes(entityType)) {
        return res.status(400).json({ success: false, message: `Entity type must be one of: ${validEntityTypes.join(', ')}` });
      }

      const entity = await db.findById(entityType + 's', entityId);
      if (!entity) {
        return res.status(404).json({ success: false, message: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} not found` });
      }

      const newReview = await db.insert('reviews', {
        rating,
        text: text || null,
        entityType,
        entityId,
        userId: req.user.id,
        userName: req.user.name,
        userPicture: null,
        timestamp: new Date().toISOString(),
        thumbsUp: 0,
        thumbsDown: 0
      });

      if (!newReview) {
        return res.status(500).json({ success: false, message: 'Failed to create review' });
      }

      res.status(201).json({
        success: true,
        data: { ...newReview, userLiked: false },
        message: 'Review created successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error creating review', error: error.message });
    }
  });

  // LIKE a review (requires auth)
  router.post('/:id/like', async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const review = await db.findById('reviews', reviewId);

      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }

      const alreadyLiked = (await db.find('review_likes', { userId: req.user.id, reviewId })).length > 0;
      if (alreadyLiked) {
        return res.status(409).json({ success: false, message: 'Already liked this review' });
      }

      await db.insert('review_likes', { userId: req.user.id, reviewId, createdAt: new Date().toISOString() });
      const updated = await db.update('reviews', reviewId, { thumbsUp: review.thumbsUp + 1 });

      res.json({
        success: true,
        data: { ...updated, userLiked: true },
        message: 'Review liked'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error liking review', error: error.message });
    }
  });

  // UNLIKE a review (requires auth)
  router.delete('/:id/like', async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const review = await db.findById('reviews', reviewId);

      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }

      const removed = await db.deleteWhere('review_likes', { userId: req.user.id, reviewId });
      if (!removed) {
        return res.status(409).json({ success: false, message: 'You have not liked this review' });
      }

      const updated = await db.update('reviews', reviewId, { thumbsUp: Math.max(0, review.thumbsUp - 1) });

      res.json({
        success: true,
        data: { ...updated, userLiked: false },
        message: 'Like removed'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error unliking review', error: error.message });
    }
  });

  // UPDATE a review
  router.put('/:id', async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const { rating, text, thumbsDown } = req.body;

      const updates = {};

      if (rating !== undefined) {
        if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
          return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5' });
        }
        updates.rating = rating;
      }

      if (text !== undefined) updates.text = text || null;

      if (thumbsDown !== undefined) {
        if (!Number.isInteger(thumbsDown) || thumbsDown < 0) {
          return res.status(400).json({ success: false, message: 'thumbsDown must be a non-negative integer' });
        }
        updates.thumbsDown = thumbsDown;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ success: false, message: 'At least one field is required for update' });
      }

      const updatedReview = await db.update('reviews', reviewId, updates);
      if (!updatedReview) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }

      res.json({ success: true, data: updatedReview, message: 'Review updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating review', error: error.message });
    }
  });

  // DELETE a review
  router.delete('/:id', async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const deleted = await db.delete('reviews', reviewId);

      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }

      // Clean up all likes for the deleted review
      await db.deleteWhere('review_likes', { reviewId });

      res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting review', error: error.message });
    }
  });

  return router;
};
