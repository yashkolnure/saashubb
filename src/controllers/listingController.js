const Listing = require('../models/Listing');
const User = require('../models/User');
const slugify = require('slugify');
const { v4: uuidv4 } = require('uuid');

const FREE_QUOTA = 3;
const PAID_LISTING_PRICE = 1000;

// @GET /api/listings — public browse
exports.getListings = async (req, res) => {
  try {
    const { search, category, deployment, listingType, pricingModel, companyStage, hasTrial, page = 1, limit = 12, sort = 'newest' } = req.query;
    const query = { status: 'active' };
    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (deployment) query.deployment = { $in: deployment.split(',') };
    if (listingType) query.listingType = listingType;
    if (pricingModel) query.pricingModel = pricingModel;
    if (companyStage) query.companyStage = companyStage;
    if (hasTrial === 'true') query.hasFreerial = true;

    const sortMap = { newest: { createdAt: -1 }, most_viewed: { viewCount: -1 }, most_inquired: { inquiryCount: -1 }, top_rated: { rating: -1 } };
    const sortOpt = sortMap[sort] || { createdAt: -1 };

    const skip = (page - 1) * limit;
    const [listings, total] = await Promise.all([
      Listing.find(query).populate('seller', 'company.legalName company.isVerified trustScore').sort(sortOpt).skip(skip).limit(Number(limit)),
      Listing.countDocuments(query)
    ]);
    res.json({ listings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// @GET /api/listings/:slug — public single listing
exports.getListing = async (req, res) => {
  try {
    const listing = await Listing.findOne({ slug: req.params.slug, status: 'active' })
      .populate('seller', 'company.legalName company.isVerified company.website trustScore responseRate createdAt');
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    listing.viewCount += 1;
    await listing.save();
    // Similar listings
    const similar = await Listing.find({ category: listing.category, status: 'active', _id: { $ne: listing._id } })
      .limit(4).select('productName tagline logo slug rating reviewCount category');
    res.json({ listing, similar });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// @POST /api/listings — seller create
// Strip empty strings from enum fields so Mongoose doesn't reject them
const ENUM_FIELDS = ['companyStage','pricingModel','minContractLength','currency','onboardingType','listingType'];
const sanitizeEnums = (body) => {
  const clean = { ...body };
  ENUM_FIELDS.forEach(f => { if (clean[f] === '' || clean[f] === null) delete clean[f]; });
  return clean;
};

exports.createListing = async (req, res) => {
  try {
    const seller = await User.findById(req.user._id);
    // Allow draft listings even before approval; they go live only after admin approves the seller
    const sellerApproved = seller.company?.verificationStatus === 'approved';
    const needsPayment = seller.listingsUsed >= FREE_QUOTA;
    const body = sanitizeEnums(req.body);
    // Generate unique slug
    let slug = slugify(body.productName, { lower: true, strict: true });
    const exists = await Listing.findOne({ slug });
    if (exists) slug = `${slug}-${uuidv4().slice(0,6)}`;

    const listing = await Listing.create({
      ...body, seller: req.user._id, slug,
      status: needsPayment ? 'draft' : (sellerApproved ? 'pending_review' : 'draft'),
      isPaid: !needsPayment,
      listingExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    if (!needsPayment) {
      seller.listingsUsed += 1;
      await seller.save();
    }
    res.status(201).json({ listing, requiresPayment: needsPayment, amount: needsPayment ? PAID_LISTING_PRICE : 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// @PUT /api/listings/:id — seller update
exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findOne({ _id: req.params.id, seller: req.user._id });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    Object.assign(listing, sanitizeEnums(req.body));
    listing.markModified('pricesByCurrency');
    listing.status = 'pending_review';
    await listing.save();
    res.json({ listing });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// @PATCH /api/listings/:id/status — seller pause/resume
exports.toggleListingStatus = async (req, res) => {
  try {
    const listing = await Listing.findOne({ _id: req.params.id, seller: req.user._id });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    listing.status = listing.status === 'active' ? 'paused' : 'active';
    await listing.save();
    res.json({ status: listing.status });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// @DELETE /api/listings/:id
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findOneAndDelete({ _id: req.params.id, seller: req.user._id });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json({ message: 'Listing deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// @GET /api/listings/seller/mine
exports.getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json({ listings });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getCategories = async (req, res) => {
  const cats = ['CRM','ERP','HR & Payroll','Marketing','Analytics','Finance','Project Management','Communication','Security','E-Commerce','Customer Support','DevOps','Education','Healthcare','Legal','Logistics','Sales','Design','Accounting','Other'];
  res.json({ categories: cats });
};