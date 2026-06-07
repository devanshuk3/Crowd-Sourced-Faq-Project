const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/faq.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Order matters — specific routes before parameterized ones
router.get('/unanswered', ctrl.getUnansweredFAQs);
router.get('/popular', ctrl.getPopularFAQs);
router.get('/search', ctrl.searchFAQs);
router.get('/similar', ctrl.getSimilarFAQs);
router.get('/stats', ctrl.getStats);

router.get('/', ctrl.getAllFAQs);
router.get('/:id', ctrl.getFAQById);
router.post('/', requireAuth, ctrl.createFAQ);
router.put('/:id', requireAdmin, ctrl.updateFAQ);
router.delete('/:id', requireAdmin, ctrl.deleteFAQ);
router.post('/:id/upvote', ctrl.upvoteFAQ);

module.exports = router;
