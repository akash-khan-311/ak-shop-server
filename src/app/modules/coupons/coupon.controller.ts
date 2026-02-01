/* eslint-disable prettier/prettier */
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { CouponService } from "./coupon.service";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/sendResponse";
export const createCoupon = catchAsync(async (req, res) => {
    const result = await CouponService.createCouponIntoDb(req.body, req.user as JwtPayload)
    sendResponse(res, {
        status: httpStatus.CREATED,
        success: true,
        message: 'Coupon created successfully',
        data: result

    })
})

export const getCoupons = catchAsync(async (req, res) => {
    const result = await CouponService.getCouponsFromDb(req.user as JwtPayload, req.query)
    sendResponse(res, {
        status: httpStatus.OK,
        success: true,
        message: 'Coupons fetched successfully',
        data: result
    })
})


export const updateCoupon = catchAsync(async (req, res) => {
    const result = await CouponService.updateCouponIntoDB(
        req.params.couponId,
        req.body,
        req.user as JwtPayload
    );

    sendResponse(res, {
        status: httpStatus.OK,
        success: true,
        message: "Coupon updated successfully",
        data: result,
    });
});

export const deleteCoupon = catchAsync(async (req, res) => {
    const result = await CouponService.deleteCouponFromDB(
        req.params.couponId,
        req.user as JwtPayload
    );

    sendResponse(res, {
        status: httpStatus.OK,
        success: true,
        message: "Coupon deleted successfully",
        data: result,
    });
});


export const toggleCouponActive = catchAsync(async (req, res) => {
    const result = await CouponService.toggleCouponActiveFromDB(
        req.params.couponId,
        req.user as JwtPayload
    );

    sendResponse(res, {
        status: httpStatus.OK,
        success: true,
        message: "Coupon active status toggled",
        data: result,
    });
});



export const applyCoupon = catchAsync(async (req, res) => {
    const result = await CouponService.applyCouponFromDB(req.body, req.user as JwtPayload);

    sendResponse(res, {
        status: httpStatus.OK,
        success: true,
        message: "Coupon applied successfully",
        data: result,
    });
});

// call this after successful payment/order confirm
export const consumeCoupon = catchAsync(async (req, res) => {
    const result = await CouponService.consumeCouponFromDB(req.body, req.user as JwtPayload);

    sendResponse(res, {
        status: httpStatus.OK,
        success: true,
        message: "Coupon consumed successfully",
        data: result,
    });
});

export const CouponController = {
    createCoupon,
    getCoupons,
    updateCoupon,
    deleteCoupon,
    toggleCouponActive,
    applyCoupon,
    consumeCoupon,
};