const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/answer.controller');

router.get('/:faqId', ctrl.getAnswersByFAQ);
router.post('/', ctrl.createAnswer);
router.put('/:id', ctrl.updateAnswer);
router.delete('/:id', ctrl.deleteAnswer);
router.post('/:id/upvote', ctrl.upvoteAnswer);

module.exports = router;
