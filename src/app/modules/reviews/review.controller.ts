/* eslint-disable prettier/prettier */
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import { ReviewService } from "./review.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
export const createReview = catchAsync(async (req, res) => {
    const files = (req.files || []) as Express.Multer.File[];
    const result = await ReviewService.createReviewIntoDb(req.body, req.user as JwtPayload, files)

    sendResponse(res, {
        status: httpStatus.OK,
        success: true,
        message: "Review Created Successfully",
        data: result
    })
})

export const getProductReviews = catchAsync(async (req, res) => {
    const result = await ReviewService.getProductReviewsFromDb(req.params.productId)
    sendResponse(res, {
        status: httpStatus.OK,
        success: true,
        message: "Product Reviews fetched successfully",
        data: result
    })
})

export const getVendorReviews = catchAsync(async (req, res) => {
    const result = await ReviewService.getVendorReviewsFromDb(req.user as JwtPayload, req.query)
    sendResponse(res, {
        status: httpStatus.OK,
        success: true,
        message: 'Vendor Reviews fetched successfully',
        data: result
    })
})

export const getVendorReviewSummary = catchAsync(async (req, res) => {
    const result = await ReviewService.getVendorReviewSummaryFromDB(req.user as JwtPayload);

    sendResponse(res, {
        status: httpStatus.OK,
        success: true,
        message: "Vendor review summary fetched successfully",
        data: result,
    });
});


export const replyToReview = catchAsync(async (req, res) => {
    const result = await ReviewService.replyToReviewFromDB(
        req.params.reviewId,
        req.body.message,
        req.user as JwtPayload
    );

    sendResponse(res, {
        status: httpStatus.OK,
        success: true,
        message: "Reply saved successfully",
        data: result,
    });
});

export const ReviewController = {
    createReview,
    getProductReviews,
    getVendorReviews,
    getVendorReviewSummary,
    replyToReview,
};