const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect, requireRole('admin'));
router.get('/stats', ctrl.getStats);
router.get('/sellers', ctrl.getSellers);
router.get('/sellers/:id', ctrl.getSellerDetail);
router.patch('/sellers/:id/verify', ctrl.verifySeller);
router.get('/listings', ctrl.getListings);
router.patch('/listings/:id/status', ctrl.updateListingStatus);
module.exports = router;
