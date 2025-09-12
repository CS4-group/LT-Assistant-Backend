const mongoose = require('mongoose');

/**
 * Club Schema - For club ratings
 */
const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Academic', 'Sports', 'Social', 'Professional', 'Other'],
    default: 'Other'
  },
  description: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Club', clubSchema);
