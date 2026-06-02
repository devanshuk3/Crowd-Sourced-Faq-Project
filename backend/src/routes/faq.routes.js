const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/faq.controller');

// Order matters — specific routes before parameterized ones
router.get('/unanswered', ctrl.getUnansweredFAQs);
router.get('/popular', ctrl.getPopularFAQs);
router.get('/search', ctrl.searchFAQs);
router.get('/similar', ctrl.getSimilarFAQs);
router.get('/stats', ctrl.getStats);

router.get('/', ctrl.getAllFAQs);
router.get('/:id', ctrl.getFAQById);
router.post('/', ctrl.createFAQ);
router.put('/:id', ctrl.updateFAQ);
router.delete('/:id', ctrl.deleteFAQ);
router.post('/:id/upvote', ctrl.upvoteFAQ);

module.exports = router;
