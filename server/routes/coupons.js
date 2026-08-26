import express from 'express';
import { validateCoupon, listCoupons, createCoupon, toggleCoupon, deleteCoupon } from '../controllers/couponController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Customer: validate a coupon code
router.post('/validate', protect, validateCoupon);

// Admin: manage coupons
router.get('/', protect, admin, listCoupons);
router.post('/', protect, admin, createCoupon);
router.put('/:id/toggle', protect, admin, toggleCoupon);
router.delete('/:id', protect, admin, deleteCoupon);

export default router;
