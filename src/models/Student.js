const mongoose = require('mongoose');

/**
 * Student Schema - For course/club/teacher rating system
 */
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  major: String,
  graduationYear: Number,
  currentYear: {
    type: String,
    enum: ['Freshman', 'Sophomore', 'Junior', 'Senior'],
    default: 'Freshman'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
