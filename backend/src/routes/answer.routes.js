const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/answer.controller');
const { requireAdmin } = require('../middleware/auth');

router.get('/:faqId', ctrl.getAnswersByFAQ);
router.post('/', ctrl.createAnswer);
router.put('/:id', requireAdmin, ctrl.updateAnswer);
router.delete('/:id', requireAdmin, ctrl.deleteAnswer);
router.post('/:id/upvote', ctrl.upvoteAnswer);

module.exports = router;
