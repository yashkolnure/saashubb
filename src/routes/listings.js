const router = require('express').Router();
const ctrl = require('../controllers/listingController');
const { protect, requireRole, requireVerified } = require('../middleware/auth');

router.get('/', ctrl.getListings);
router.get('/categories', ctrl.getCategories);
router.get('/seller/mine', protect, requireRole('seller'), ctrl.getMyListings);
router.get('/:slug', ctrl.getListing);
router.post('/', protect, requireRole('seller'), requireVerified, ctrl.createListing);
router.put('/:id', protect, requireRole('seller'), ctrl.updateListing);
router.patch('/:id/toggle', protect, requireRole('seller'), ctrl.toggleListingStatus);
router.delete('/:id', protect, requireRole('seller'), ctrl.deleteListing);

module.exports = router;

// Reviews
const Review = require('../models/Review');

router.get('/:listingId/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId, isApproved: true })
      .populate('reviewer', 'name').sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:listingId/reviews', protect, async (req, res) => {
  try {
    const { rating, title, content, pros, cons } = req.body;
    const exists = await Review.findOne({ listing: req.params.listingId, reviewer: req.user._id });
    if (exists) return res.status(400).json({ error: 'You have already reviewed this listing' });
    const review = await Review.create({ listing: req.params.listingId, reviewer: req.user._id, rating, title, content, pros, cons });
    res.status(201).json({ review });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
