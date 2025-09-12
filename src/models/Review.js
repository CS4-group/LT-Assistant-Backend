const mongoose = require('mongoose');

/**
 * Review Schema - Main feature for rating courses/teachers/clubs
 */
const reviewSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  reviewType: {
    type: String,
    enum: ['course', 'teacher', 'club'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  reviewText: String,
  tags: [String],
  semester: String,
  isAnonymous: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);
