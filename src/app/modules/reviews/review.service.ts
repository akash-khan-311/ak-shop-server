/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */

import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import mongoose from "mongoose";
import { Product } from "../products/product.model";
import { Review } from "./review.model";
import { cloudinary } from "../../config/cloudinary";
export const createReviewIntoDb = async (payload: {
    productId: string; orderId?: string; rating: number, comment: string
}, user: JwtPayload, files: Express.Multer.File[]) => {
    const { productId, rating, comment } = payload;
    const userId = user._id
    const userName = (user as any)?.name;
    const userEmail = (user as any)?.email;

    if (!userId) throw new AppError(httpStatus.UNAUTHORIZED, "Invalid user for create review");
    if (!payload.productId) throw new AppError(httpStatus.BAD_REQUEST, "ProductId required for create review");
    if (!mongoose.Types.ObjectId.isValid(payload.productId)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid productId for create review");
    }

    const product = await Product.findOne({ _id: payload.productId, isDeleted: false })
    if (!product) throw new AppError(httpStatus.NOT_FOUND, "Product not found");

    const vendorId = (product as any).vendorId;
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Product vendor(userId) invalid");
    }

    if (payload.orderId && !mongoose.Types.ObjectId.isValid(payload.orderId)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid orderId");
    }
    const exists = await Review.findOne({
        productId,
        userId,
        isDeleted: false,
    });
    if (exists) throw new AppError(httpStatus.CONFLICT, "You already reviewed this product");
    const images: { url: string; public_id: string }[] = [];
    if (Array.isArray(files) && files.length > 0) {
        for (const file of files) {
            const uploadResult = await cloudinary.uploader.upload(
                `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
                { folder: "reviews" }
            );

            images.push({
                url: uploadResult.secure_url,
                public_id: uploadResult.public_id,
            });
        }
    }
    const doc = await Review.create({
        productId: payload.productId,
        orderId: payload.orderId && mongoose.Types.ObjectId.isValid(payload.orderId) ? payload.orderId : null,
        vendorId,
        userId,
        userName,
        userEmail,
        rating: Number(rating),
        comment,
        images,
        status: "pending",
        isDeleted: false,
    });

    return doc

}

export const getProductReviewsFromDb = async (productId: string) => {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid productId")
    }

    const reviews = await Review.find({ productId, status: "approved", isDeleted: false }).sort({ createdAt: -1 })
    return reviews
}

export const getVendorReviewsFromDb = async (user: JwtPayload, query: any) => {
    const vendorId = user._id
    if (!vendorId) throw new AppError(httpStatus.UNAUTHORIZED, 'invalid vendor')


    const page = Math.max(Number(query?.page || 1), 1);
    const limit = Math.min(Math.max(Number(query?.limit || 10), 1), 100);
    const search = (query?.searchTerm as string)?.trim();
    const status = query?.status || "all";
    const rating = query?.rating || "all";
    const productId = query?.productId;

    const filter: any = { vendorId, isDeleted: false };

    if (status && status !== "all") filter.status = status;
    if (rating && rating !== "all") filter.rating = Number(rating);
    if (productId) {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            throw new AppError(httpStatus.BAD_REQUEST, "Invalid productId");
        }
        filter.productId = productId;
    }

    if (search) {
        filter.$or = [
            { comment: { $regex: search, $options: "i" } },
            { userName: { $regex: search, $options: "i" } },
            { userEmail: { $regex: search, $options: "i" } },
        ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
        Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Review.countDocuments(filter),
    ]);

    return {
        items, meta: { page, limit, total, totalPage: Math.ceil(total / limit) }
    }
}

export const getVendorReviewSummaryFromDB = async (user: JwtPayload) => {
    const vendorId = user._id
    if (!vendorId) throw new AppError(httpStatus.UNAUTHORIZED, "Invalid vendor");

    const match = { vendorId, isDeleted: false };

    const [summary] = await Review.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                avgRating: { $avg: "$rating" },
                pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
                approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
                rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
                r1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
                r2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
                r3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
                r4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
                r5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
            },
        },
    ]);

    return (
        summary || {
            total: 0,
            avgRating: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            r1: 0, r2: 0, r3: 0, r4: 0, r5: 0,
        }
    );
};

export const replyToReviewFromDB = async (
    reviewId: string,
    message: string,
    user: JwtPayload
) => {
    const vendorId = user._id
    const role = (user as any)?.role;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid reviewId");
    }

    // vendor can only reply to their own reviews
    const filter: any = { _id: reviewId, isDeleted: false };

    if (role === "vendor") filter.vendorId = vendorId;

    const review = await Review.findOne(filter);
    if (!review) throw new AppError(httpStatus.NOT_FOUND, "Review not found");

    review.reply = {
        message,
        repliedBy: role === "admin" || role === "superAdmin" ? "admin" : "vendor",
        repliedAt: new Date(),
    } as any;

    await review.save();
    return review;
};

export const ReviewService = {
    createReviewIntoDb,
    getProductReviewsFromDb,
    getVendorReviewsFromDb,
    getVendorReviewSummaryFromDB,
    replyToReviewFromDB,
};