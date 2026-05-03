const router = require('express').Router();
const ctrl = require('../controllers/sellerController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect, requireRole('seller'));
router.get('/dashboard', ctrl.getDashboard);
router.get('/reviews', ctrl.getReviews);
router.post('/reviews/:reviewId/reply', ctrl.replyToReview);

module.exports = router;
