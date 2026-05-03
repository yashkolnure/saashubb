const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, maxlength: 100 },
  content: { type: String, required: true, maxlength: 1000 },
  pros: String,
  cons: String,
  isVerifiedBuyer: { type: Boolean, default: false },
  sellerReply: String,
  sellerRepliedAt: Date,
  isApproved: { type: Boolean, default: false },
  isReported: { type: Boolean, default: false },
}, { timestamps: true });

reviewSchema.index({ listing: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
