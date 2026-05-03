const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { sendEmail } = require('../utils/email');
const crypto = require('crypto');

// @POST /api/auth/register/buyer
exports.registerBuyer = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const token = crypto.randomBytes(32).toString('hex');
    const user = await User.create({ email, password, name, role: 'buyer', emailVerifyToken: token });
    await sendEmail({ to: email, subject: 'Verify your SaaSHub account', html: `<p>Click <a href="${process.env.FRONTEND_URL}/verify-email/${token}">here</a> to verify.</p>` });
    res.status(201).json({ message: 'Account created. Please verify your email.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @POST /api/auth/register/seller
exports.registerSeller = async (req, res) => {
  try {
    const { email, password, company } = req.body;
    // Block personal email domains
    const personalDomains = ['gmail.com','yahoo.com','hotmail.com','outlook.com','rediffmail.com'];
    const domain = email.split('@')[1];
    if (personalDomains.includes(domain)) return res.status(400).json({ error: 'Please use your official company email address' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const token = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      email, password, name: company.signatoryName, role: 'seller',
      company, emailVerifyToken: token, isVerified: false,
    });
    await sendEmail({ to: email, subject: 'Verify your SaaSHub Seller account', html: `<p>Hi ${company.legalName}, click <a href="${process.env.FRONTEND_URL}/verify-email/${token}">here</a> to verify your email.</p>` });
    res.status(201).json({ message: 'Seller account created. Please verify your email. Account will be reviewed by our team.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.isLocked()) return res.status(423).json({ error: 'Account temporarily locked. Try again later.' });
    const match = await user.comparePassword(password);
    if (!match) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= 5) user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();
    const token = generateToken(user._id, user.role);
    res.json({
      token,
      user: { _id: user._id, email: user.email, name: user.name, role: user.role,
        isVerified: user.isVerified, company: user.company, trustScore: user.trustScore,
        listingsUsed: user.listingsUsed, freeListingsQuota: user.freeListingsQuota }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @GET /api/auth/verify-email/:token
exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ emailVerifyToken: req.params.token });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });
    user.isVerified = true;
    user.emailVerifyToken = undefined;
    await user.save();
    res.json({ message: 'Email verified successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

// @POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.json({ message: 'If that email exists, a reset link was sent.' });
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpire = Date.now() + 3600000;
    await user.save();
    await sendEmail({ to: user.email, subject: 'Reset your password', html: `<p>Click <a href="${process.env.FRONTEND_URL}/reset-password/${token}">here</a> to reset. Expires in 1 hour.</p>` });
    res.json({ message: 'Reset link sent to your email.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
