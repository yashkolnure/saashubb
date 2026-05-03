const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  name: { type: String, trim: true },
  isVerified: { type: Boolean, default: false },
  emailVerifyToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  // Seller-specific fields
  company: {
    legalName: String,
    gstNumber: String,
    cinNumber: String,
    businessPAN: String,
    registeredAddress: String,
    officialEmail: String,
    website: String,
    signatoryName: String,
    signatoryDesignation: String,
    linkedinPage: String,
    isVerified: { type: Boolean, default: false },
    verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    verificationNotes: String,
  },
  trustScore: { type: Number, default: 0, min: 0, max: 100 },
  listingsUsed: { type: Number, default: 0 },
  freeListingsQuota: { type: Number, default: 3 },
  responseRate: { type: Number, default: 0 },
  avgResponseTime: Number,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.isLocked = function() {
  return this.lockUntil && this.lockUntil > Date.now();
};

module.exports = mongoose.model('User', userSchema);
