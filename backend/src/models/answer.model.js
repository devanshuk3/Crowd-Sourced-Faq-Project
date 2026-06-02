const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  faqId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FAQ',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    name: { type: String, required: true },
    email: { type: String },
  },
  upvoteCount: { type: Number, default: 0 },
  isAccepted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Answer', answerSchema);
