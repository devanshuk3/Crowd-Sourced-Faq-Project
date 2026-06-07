const Fuse = require('fuse.js');
const FAQ = require('../../models/faq.model');
const Answer = require('../../models/answer.model');

// Cached index state
let fuseInstance = null;
let indexValid = false;

// Fuse.js configuration with weighted fields
const FUSE_OPTIONS = {
  keys: [
    { name: 'title', weight: 0.3 },
    { name: 'tags', weight: 0.25 },
    { name: 'description', weight: 0.2 },
    { name: 'answerContent', weight: 0.15 },
  ],
  threshold: 0.4,       // confidence threshold — lower = stricter
  includeScore: true,
  includeMatches: false,
  minMatchCharLength: 2,
  ignoreLocation: true,  // search the whole field, not just the beginning
};

/**
 * Build (or rebuild) the Fuse index from the database.
 */
async function buildIndex() {
  // Fetch all FAQs
  const faqs = await FAQ.find().lean();

  // Fetch the best answer for each FAQ (accepted first, then highest-voted)
  const faqIds = faqs.map(f => f._id);
  const answers = await Answer.find({ faqId: { $in: faqIds } })
    .sort({ isAccepted: -1, upvoteCount: -1 })
    .lean();

  // Group answers by FAQ id — keep only the top answer per FAQ
  const answerMap = {};
  for (const ans of answers) {
    const key = ans.faqId.toString();
    if (!answerMap[key]) {
      answerMap[key] = ans.content;
    }
  }

  // Build search documents
  const docs = faqs.map(faq => ({
    _id: faq._id,
    title: faq.title,
    description: faq.description,
    tags: (faq.tags || []).join(' '),
    answerContent: answerMap[faq._id.toString()] || '',
    category: faq.category,
    status: faq.status,
    upvoteCount: faq.upvoteCount || 0,
    viewCount: faq.viewCount || 0,
    rawAnswer: answerMap[faq._id.toString()] || null,
  }));

  fuseInstance = new Fuse(docs, FUSE_OPTIONS);
  indexValid = true;
}

/**
 * Search FAQs using Fuse.js. Lazily rebuilds the index if invalidated.
 * @param {string} query - The user's question
 * @param {number} [limit=5] - Max results to return
 * @returns {Promise<Array>} Ranked search results
 */
async function searchFAQs(query, limit = 5) {
  if (!fuseInstance || !indexValid) {
    await buildIndex();
  }

  const results = fuseInstance.search(query, { limit });

  // Map to a cleaner shape
  return results.map(r => ({
    _id: r.item._id,
    title: r.item.title,
    description: r.item.description,
    category: r.item.category,
    status: r.item.status,
    answerContent: r.item.rawAnswer,
    score: r.score, // lower = better match
    upvoteCount: r.item.upvoteCount,
  }));
}

/**
 * Mark the index as stale. The next searchFAQs() call will rebuild it.
 * Called by FAQ and Answer controllers on mutations.
 */
function invalidateIndex() {
  indexValid = false;
}

module.exports = { searchFAQs, invalidateIndex };
