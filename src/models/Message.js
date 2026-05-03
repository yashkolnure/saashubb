const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 2000 },
  isRead: { type: Boolean, default: false },
  messageIndex: { type: Number, default: 0 },
  isFiltered: { type: Boolean, default: false },
  filterReason: String,
  isReported: { type: Boolean, default: false },
  reportReason: String,
}, { timestamps: true });

const threadSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [messageSchema],
  lastMessage: Date,
  buyerCompanyName: String,
  buyerUseCase: String,
  buyerBudgetRange: String,
  buyerCompanySize: String,
  status: { type: String, enum: ['active', 'archived', 'blocked'], default: 'active' },
  disclaimerAccepted: { type: Boolean, default: false },
  disclaimerAcceptedAt: Date,
}, { timestamps: true });

threadSchema.index({ listing: 1, buyer: 1 }, { unique: true });
threadSchema.index({ seller: 1, lastMessage: -1 });
threadSchema.index({ buyer: 1, lastMessage: -1 });

module.exports = mongoose.model('Thread', threadSchema);
