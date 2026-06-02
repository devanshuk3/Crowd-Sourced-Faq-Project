const Answer = require('../models/answer.model');
const FAQ = require('../models/faq.model');

// GET /answers/:faqId
exports.getAnswersByFAQ = async (req, res) => {
  try {
    const answers = await Answer.find({ faqId: req.params.faqId })
      .sort({ isAccepted: -1, upvoteCount: -1 })
      .lean();
    res.json(answers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /answers
exports.createAnswer = async (req, res) => {
  try {
    const { faqId, content, author } = req.body;
    if (!faqId || !content || !author?.name) {
      return res.status(400).json({ message: 'faqId, content, and author.name are required' });
    }

    const faq = await FAQ.findById(faqId);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });

    const answer = new Answer({ faqId, content, author });
    await answer.save();

    // Update FAQ status to Answered
    await FAQ.findByIdAndUpdate(faqId, { status: 'Answered' });

    res.status(201).json(answer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /answers/:id
exports.updateAnswer = async (req, res) => {
  try {
    const { content, isAccepted } = req.body;
    const updates = {};
    if (content !== undefined) updates.content = content;
    if (isAccepted !== undefined) updates.isAccepted = isAccepted;

    const answer = await Answer.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!answer) return res.status(404).json({ message: 'Answer not found' });
    res.json(answer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /answers/:id
exports.deleteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findByIdAndDelete(req.params.id);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });

    // Check if FAQ still has answers, if not revert to Unanswered
    const remainingAnswers = await Answer.countDocuments({ faqId: answer.faqId });
    if (remainingAnswers === 0) {
      await FAQ.findByIdAndUpdate(answer.faqId, { status: 'Unanswered' });
    }

    res.json({ message: 'Answer deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /answers/:id/upvote
exports.upvoteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findByIdAndUpdate(req.params.id, { $inc: { upvoteCount: 1 } }, { new: true });
    if (!answer) return res.status(404).json({ message: 'Answer not found' });
    res.json({ upvoteCount: answer.upvoteCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
