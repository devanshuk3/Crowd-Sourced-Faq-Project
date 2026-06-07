const mongoose = require('mongoose');

const unansweredQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  normalizedQuestion: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  askCount: {
    type: Number,
    default: 1,
  },
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('UnansweredQuestion', unansweredQuestionSchema);
