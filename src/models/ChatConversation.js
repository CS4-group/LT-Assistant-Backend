const mongoose = require('mongoose');

/**
 * ChatConversation Schema - For AI course planning chatbot
 */
const chatConversationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['student', 'ai'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  context: {
    type: String,
    enum: ['course-planning', 'course-questions', 'general'],
    default: 'general'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ChatConversation', chatConversationSchema);
