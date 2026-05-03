const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({ windowMs: 15*60*1000, max: 10, message: { error: 'Too many login attempts' } });

router.post('/register/buyer', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').notEmpty().trim(),
], validate, ctrl.registerBuyer);

router.post('/register/seller', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('company.legalName').notEmpty().withMessage('Company name required'),
  body('company.gstNumber').notEmpty().withMessage('GST number required'),
  body('company.registeredAddress').notEmpty().withMessage('Registered address required'),
  body('company.signatoryName').notEmpty().withMessage('Signatory name required'),
], validate, ctrl.registerSeller);

router.post('/login', loginLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], validate, ctrl.login);

router.get('/verify-email/:token', ctrl.verifyEmail);
router.get('/me', protect, ctrl.getMe);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password/:token', [body('password').isLength({ min: 8 })], validate, ctrl.resetPassword);

module.exports = router;
