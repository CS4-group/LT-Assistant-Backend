const mongoose = require('mongoose');

/**
 * Teacher Schema - For teacher ratings
 */
const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  department: String,
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Teacher', teacherSchema);
