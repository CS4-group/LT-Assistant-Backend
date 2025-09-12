const mongoose = require('mongoose');

/**
 * Course Schema - For course catalog and planning
 */
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  courseKey: {
    type: String,
    required: true,
  },
  grade: [{
    type: Number
  }],
  length: {
    type: String,
    required: true
  },
  credit: {
    type: Number,
    required: true
  },
  prerequisite: {
    type: Number,
    required: false
  },
  courseNumber: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
