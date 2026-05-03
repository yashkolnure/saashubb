const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingType: { type: String, enum: ['whitelabel', 'saas'], required: true, default: 'saas' },
  isRebrandable: { type: Boolean, default: false },
  hasResellRights: { type: Boolean, default: false },
  isFullSourceCode: { type: Boolean, default: false },
  whitelabelDetails: String,
  slug: { type: String, unique: true, lowercase: true },
  status: { type: String, enum: ['draft', 'active', 'paused', 'rejected', 'pending_review'], default: 'pending_review' },
  isPaid: { type: Boolean, default: false },
  paymentId: String,

  // Basic Info
  productName: { type: String, required: true, trim: true },
  tagline: { type: String, maxlength: 160 },
  category: { type: String, required: true },
  additionalCategories: [{ type: String }],
  shortDescription: { type: String, maxlength: 250 },
  fullDescription: String,
  logo: String,
  screenshots: [String],
  demoVideoUrl: String,
  productWebsite: String,
  foundedYear: Number,
  companyStage: { type: String, enum: ['startup', 'growth', 'enterprise'], default: undefined },

  // Pricing
  pricingModel: { type: String, enum: ['per_seat', 'usage_based', 'flat', 'one_time', 'hybrid', 'custom'], default: undefined },
  askPriceOnly: { type: Boolean, default: true },
  startingPrice: { type: Number, default: null },        // Optional base price in `currency`
  pricesByCurrency: { type: mongoose.Schema.Types.Mixed, default: {} }, // { USD: 99, EUR: 89, ... }
  hasFreerial: { type: Boolean, default: false },
  freeTrialDays: Number,
  minContractLength: { type: String, enum: ['monthly', 'annual', 'custom'], default: undefined },
  refundPolicy: String,
  paymentMethods: [String],
  currency: {
    type: String,
    enum: ['INR','USD','EUR','GBP','AED','SGD','AUD','CAD','JPY','MYR','BRL','ZAR','CHF','SEK','NOK','DKK'],
    default: 'INR',
  },

  // Technical
  deployment: [{ type: String, enum: ['cloud', 'on_premise', 'hybrid'] }],
  platforms: [{ type: String, enum: ['web', 'ios', 'android', 'desktop'] }],
  hasApi: { type: Boolean, default: false },
  apiDocUrl: String,
  integrations: [String],
  securityCerts: [String],
  dataResidency: String,
  uptimeSla: String,
  isOpenSource: { type: Boolean, default: false },
  repoUrl: String,

  // Target market
  targetIndustries: [String],
  targetCompanySize: [{ type: String, enum: ['smb', 'mid_market', 'enterprise'] }],
  keyFeatures: [String],
  languagesSupported: [String],
  useCases: [{
    title: String,
    description: String,
  }],
  customerLogos: [{ name: String, logo: String, showLogo: { type: Boolean, default: false } }],
  testimonials: [{
    name: String,
    designation: String,
    company: String,
    quote: String,
    approved: { type: Boolean, default: false }
  }],
  faq: [{ question: String, answer: String }],

  // Support
  supportChannels: [{ type: String, enum: ['email', 'chat', 'phone', 'slack'] }],
  supportHours: String,
  supportTimezone: String,
  onboardingType: { type: String, enum: ['self_serve', 'assisted', 'custom'], default: undefined },
  documentationUrl: String,
  offersTraining: { type: Boolean, default: false },
  hasDedicatedManager: { type: Boolean, default: false },

  // Stats
  viewCount: { type: Number, default: 0 },
  inquiryCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },

  listingExpiresAt: Date,
}, { timestamps: true });

listingSchema.index({ productName: 'text', tagline: 'text', shortDescription: 'text', keyFeatures: 'text' });
listingSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model('Listing', listingSchema);