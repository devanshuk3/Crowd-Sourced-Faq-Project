const { searchFAQs } = require('../utils/fuseSearch');
const UnansweredQuestion = require('../models/unansweredQuestion.model');

/**
 * POST /api/chat
 * Body: { message: string }
 */
exports.handleChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'A non-empty "message" field is required.' });
    }

    const query = message.trim();
    const results = await searchFAQs(query, 5);

    // No confident matches found
    if (results.length === 0) {
      // Store/increment the unanswered question
      const normalized = query.toLowerCase().trim();
      await UnansweredQuestion.findOneAndUpdate(
        { normalizedQuestion: normalized },
        {
          $setOnInsert: { question: query, normalizedQuestion: normalized },
          $inc: { askCount: 1 },
        },
        { upsert: true, new: true }
      );

      return res.json({
        matched: false,
        answer: null,
        source: null,
        relatedQuestions: [],
        message: "Sorry, I couldn't find a relevant answer for your question. It has been noted and our community may answer it soon!",
      });
    }

    // Best match
    const best = results[0];

    // Related questions (remaining results, excluding the best)
    const relatedQuestions = results.slice(1).map(r => ({
      id: r._id,
      title: r.title,
    }));

    // Format response
    const answer = best.answerContent
      ? best.answerContent
      : 'This question exists in our FAQ but hasn\'t been answered yet. You can help by answering it!';

    return res.json({
      matched: true,
      answer,
      source: {
        id: best._id,
        title: best.title,
        category: best.category,
        status: best.status,
      },
      relatedQuestions,
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
