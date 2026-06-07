const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Registration', 'Technical Events', 'Cultural Events', 'Accommodation', 'Transportation', 'General Information'],
  },
  status: {
    type: String,
    enum: ['Answered', 'Unanswered'],
    default: 'Unanswered',
  },
  author: {
    name: { type: String, required: true },
    email: { type: String },
  },
  upvoteCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  tags: [{ type: String }],
}, { timestamps: true });

faqSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('FAQ', faqSchema);
