/* eslint-disable prettier/prettier */
import express from 'express'
import auth from '../../middlewares/auth'
import validateRequest from '../../middlewares/validateRequest'
import { CouponValidation } from './coupon.validation';
import { CouponController } from './coupon.controller';


const router = express.Router();

//  admin create coupon
router.post(
    "/",
    auth("admin", "superAdmin"),
    validateRequest(CouponValidation.createCouponSchema),
    CouponController.createCoupon
);

//  admin list coupons
router.get(
    "/",
    auth("admin", "superAdmin"),
    validateRequest(CouponValidation.getCouponsSchema),
    CouponController.getCoupons
);

//  admin update coupon
router.patch(
    "/:couponId",
    auth("admin", "superAdmin"),
    validateRequest(CouponValidation.updateCouponSchema),
    CouponController.updateCoupon
);

//  admin delete coupon (soft)
router.delete(
    "/:couponId",
    auth("admin", "superAdmin"),
    CouponController.deleteCoupon
);

//  admin toggle active
router.patch(
    "/:couponId/toggle",
    auth("admin", "superAdmin"),
    CouponController.toggleCouponActive
);

//  user apply coupon (checkout)
router.post(
    "/apply",
    auth("user"),
    validateRequest(CouponValidation.applyCouponSchema),
    CouponController.applyCoupon
);

//  user consume coupon (after payment success)
router.post(
    "/consume",
    auth("user"),
    validateRequest(CouponValidation.consumeCouponSchema),
    CouponController.consumeCoupon
);

export const CouponRoutes = router