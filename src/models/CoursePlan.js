const mongoose = require('mongoose');

/**
 * CoursePlan Schema - 4-year academic planning
 */
const coursePlanSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  planName: {
    type: String,
    default: '4-Year Plan'
  },
  semesters: [{
    semesterName: String, // "Fall 2024"
    courses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }],
    totalCredits: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('CoursePlan', coursePlanSchema);
