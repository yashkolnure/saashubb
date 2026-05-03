const router = require('express').Router();
const ctrl = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const msgLimiter = rateLimit({ windowMs: 60*1000, max: 20, message: { error: 'Message rate limit exceeded' } });

router.use(protect);
router.post('/start', msgLimiter, ctrl.startThread);
router.post('/:threadId/reply', msgLimiter, ctrl.sendMessage);
router.get('/threads', ctrl.getThreads);
router.get('/:threadId', ctrl.getThread);
router.post('/:threadId/report', ctrl.reportThread);

module.exports = router;
