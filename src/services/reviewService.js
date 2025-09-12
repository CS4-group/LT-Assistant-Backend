const { Review } = require('../models');

/**
 * Review Service - For managing course/teacher/club reviews
 */
class ReviewService {
  async createReview(reviewData) {
    const review = new Review(reviewData);
    return await review.save();
  }

  async getReviewById(reviewId) {
    return await Review.findById(reviewId).populate('studentId');
  }

  async getAllReviews() {
    return await Review.find().populate('studentId');
  }

  async getReviewsByTarget(reviewType, targetId) {
    return await Review.find({ reviewType, targetId }).populate('studentId');
  }

  async updateReview(reviewId, updateData) {
    return await Review.findByIdAndUpdate(reviewId, updateData, { new: true });
  }

  async deleteReview(reviewId) {
    return await Review.findByIdAndDelete(reviewId);
  }
}

module.exports = new ReviewService();
