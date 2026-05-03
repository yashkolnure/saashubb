const User = require('../models/User');
const Listing = require('../models/Listing');
const Thread = require('../models/Message');

// GET /api/admin/sellers — all sellers with verification status
exports.getSellers = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { role: 'seller' };
    if (status) query['company.verificationStatus'] = status;
    const sellers = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ sellers });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/admin/sellers/:id
exports.getSellerDetail = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id).select('-password');
    if (!seller) return res.status(404).json({ error: 'Seller not found' });
    const listings = await Listing.find({ seller: seller._id });
    res.json({ seller, listings });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// PATCH /api/admin/sellers/:id/verify — approve or reject
exports.verifySeller = async (req, res) => {
  try {
    const { action, notes } = req.body; // action: 'approve' | 'reject'
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'Invalid action' });
    const seller = await User.findById(req.params.id);
    if (!seller || seller.role !== 'seller') return res.status(404).json({ error: 'Seller not found' });

    seller.company.verificationStatus = action === 'approve' ? 'approved' : 'rejected';
    seller.company.isVerified = action === 'approve';
    seller.company.verificationNotes = notes || '';
    if (action === 'approve') {
      seller.isVerified = true;
      // Recalculate trust score
      let score = 50;
      if (seller.company.gstNumber) score += 15;
      if (seller.company.cinNumber) score += 10;
      if (seller.company.website) score += 10;
      if (seller.company.linkedinPage) score += 5;
      if (seller.company.businessPAN) score += 10;
      seller.trustScore = Math.min(100, score);
    }
    await seller.save();

    // Auto-activate pending listings if approved
    if (action === 'approve') {
      await Listing.updateMany({ seller: seller._id, status: 'pending_review' }, { status: 'active' });
    }

    res.json({ message: `Seller ${action}d successfully`, seller });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/admin/listings — all listings with moderation controls
exports.getListings = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const listings = await Listing.find(query).populate('seller', 'company.legalName email company.isVerified').sort({ createdAt: -1 });
    res.json({ listings });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// PATCH /api/admin/listings/:id/status
exports.updateListingStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    const wasntActive = listing.status !== 'active';
    listing.status = status;
    if (reason) listing.rejectionReason = reason;
    await listing.save();
    // Ping search engines the moment a listing goes live
    if (status === 'active' && wasntActive) {
      const { pingAsync } = require('../utils/indexNow');
      pingAsync([`/listings/${listing.slug}`]);
    }
    res.json({ listing });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [totalSellers, pendingSellers, totalListings, activeListings, totalThreads] = await Promise.all([
      User.countDocuments({ role: 'seller' }),
      User.countDocuments({ role: 'seller', 'company.verificationStatus': 'pending' }),
      Listing.countDocuments(),
      Listing.countDocuments({ status: 'active' }),
      Thread.countDocuments(),
    ]);
    const recentSellers = await User.find({ role: 'seller' }).sort({ createdAt: -1 }).limit(5).select('company.legalName email company.verificationStatus createdAt');
    const recentListings = await Listing.find({ status: 'pending_review' }).sort({ createdAt: -1 }).limit(5).populate('seller', 'company.legalName');
    res.json({ stats: { totalSellers, pendingSellers, totalListings, activeListings, totalThreads }, recentSellers, recentListings });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
