/* eslint-disable prettier/prettier */
import z from "zod";

export const createReviewSchema = z.object({
    body: z.object({
        productId: z.string().min(1, "ProductId is required"),
        orderId: z.string().optional(),
        rating: z.number().min(1).max(5),
        comment: z.string().min(3).max(1000),
    }),
});

export const replyReviewSchema = z.object({
    params: z.object({
        reviewId: z.string().min(1, "reviewId is required"),
    }),
    body: z.object({
        message: z.string().min(2).max(800),
    }),
});

export const getProductReviewsSchema = z.object({
    params: z.object({
        productId: z.string().min(1, "productId is required"),
    }),
});

export const getVendorReviewsSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        search: z.string().optional(),
        status: z.enum(["all", "pending", "approved", "rejected"]).optional(),
        rating: z.string().optional(), // "all" | "1".."5"
        productId: z.string().optional(),
    }).optional(),
});

export const ReviewValidation = {
    createReviewSchema,
    replyReviewSchema,
    getProductReviewsSchema,
    getVendorReviewsSchema,
};
