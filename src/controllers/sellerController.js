const Listing = require('../models/Listing');
const Review = require('../models/Review');
const Thread = require('../models/Message');
const User = require('../models/User');

exports.getDashboard = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const [listings, threads, reviews] = await Promise.all([
      Listing.find({ seller: sellerId }),
      Thread.find({ seller: sellerId }).populate('listing', 'productName'),
      Review.find({ listing: { $in: (await Listing.find({ seller: sellerId })).map(l => l._id) }, isApproved: true }),
    ]);
    const totalViews = listings.reduce((a, l) => a + l.viewCount, 0);
    const totalInquiries = listings.reduce((a, l) => a + l.inquiryCount, 0);
    const unreadThreads = threads.filter(t => t.messages.some(m => m.receiver.equals(sellerId) && !m.isRead)).length;
    const avgRating = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : 0;
    res.json({ stats: { totalListings: listings.length, activeListings: listings.filter(l => l.status === 'active').length, totalViews, totalInquiries, unreadThreads, avgRating, totalReviews: reviews.length, listingsUsed: req.user.listingsUsed, freeQuota: req.user.freeListingsQuota }, listings });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getReviews = async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user._id }).select('_id');
    const reviews = await Review.find({ listing: { $in: listings.map(l => l._id) } })
      .populate('reviewer', 'name').populate('listing', 'productName');
    res.json({ reviews });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.replyToReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId).populate('listing');
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (!review.listing.seller.equals(req.user._id)) return res.status(403).json({ error: 'Access denied' });
    review.sellerReply = req.body.reply;
    review.sellerRepliedAt = new Date();
    await review.save();
    res.json({ review });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
