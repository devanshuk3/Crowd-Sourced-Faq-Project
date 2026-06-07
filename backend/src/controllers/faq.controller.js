const FAQ = require('../models/faq.model');
const Answer = require('../models/answer.model');
const { invalidateIndex } = require('../chatbot/utils/fuseSearch');

const CATEGORIES = ['Registration', 'Technical Events', 'Cultural Events', 'Accommodation', 'Transportation', 'General Information'];

// GET /faqs
exports.getAllFAQs = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, sort = 'newest' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    let sortObj = {};
    if (sort === 'popular') sortObj = { upvoteCount: -1 };
    else if (sort === 'views') sortObj = { viewCount: -1 };
    else sortObj = { createdAt: -1 };

    const [faqs, total] = await Promise.all([
      FAQ.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit)).lean(),
      FAQ.countDocuments(filter),
    ]);

    res.json({
      data: faqs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /faqs/:id
exports.getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).lean();
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });

    const answers = await Answer.find({ faqId: req.params.id }).sort({ isAccepted: -1, upvoteCount: -1 }).lean();
    res.json({ ...faq, answers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /faqs
exports.createFAQ = async (req, res) => {
  try {
    const { title, description, category, author, tags } = req.body;

    if (!title || !description || !category || !author?.name) {
      return res.status(400).json({ message: 'title, description, category, and author.name are required' });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const faq = new FAQ({ title, description, category, author, tags });
    await faq.save();
    invalidateIndex();
    res.status(201).json(faq);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /faqs/:id
exports.updateFAQ = async (req, res) => {
  try {
    const allowed = ['title', 'description', 'category', 'status', 'tags'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const faq = await FAQ.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    invalidateIndex();
    res.json(faq);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /faqs/:id
exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    await Answer.deleteMany({ faqId: req.params.id });
    invalidateIndex();
    res.json({ message: 'FAQ deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /faqs/unanswered
exports.getUnansweredFAQs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [faqs, total] = await Promise.all([
      FAQ.find({ status: 'Unanswered' }).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      FAQ.countDocuments({ status: 'Unanswered' }),
    ]);
    res.json({ data: faqs, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /faqs/popular
exports.getPopularFAQs = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const faqs = await FAQ.find().sort({ upvoteCount: -1, viewCount: -1 }).limit(parseInt(limit)).lean();
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /faqs/search
exports.searchFAQs = async (req, res) => {
  try {
    const { q, category, page = 1, limit = 10 } = req.query;
    if (!q) return res.status(400).json({ message: 'Query param q is required' });

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = { $text: { $search: q } };
    if (category) filter.category = category;

    const [faqs, total] = await Promise.all([
      FAQ.find(filter, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip).limit(parseInt(limit)).lean(),
      FAQ.countDocuments(filter),
    ]);
    res.json({ data: faqs, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /faqs/:id/upvote
exports.upvoteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, { $inc: { upvoteCount: 1 } }, { new: true });
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    res.json({ upvoteCount: faq.upvoteCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /faqs/similar — duplicate detection
exports.getSimilarFAQs = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query param q is required' });
    const faqs = await FAQ.find({ $text: { $search: q } }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(5).lean();
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /faqs/stats
exports.getStats = async (req, res) => {
  try {
    const [total, answered, unanswered, popular] = await Promise.all([
      FAQ.countDocuments(),
      FAQ.countDocuments({ status: 'Answered' }),
      FAQ.countDocuments({ status: 'Unanswered' }),
      FAQ.find().sort({ upvoteCount: -1 }).limit(3).select('title upvoteCount viewCount').lean(),
    ]);
    res.json({ total, answered, unanswered, popular });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
