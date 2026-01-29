/* eslint-disable prettier/prettier */
import mongoose, { Schema } from "mongoose";
import { IReview, IReviewReply } from "./review.interface";

const reviewReplySchema = new Schema<IReviewReply>(
    {
        message: { type: String, required: true, trim: true },
        repliedBy: { type: String, enum: ["vendor", "admin"], required: true },
        repliedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);
const reviewImageSchema = new Schema(
    {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
    },
    { _id: false }
);
const reviewSchema = new Schema<IReview>(
    {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
        vendorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        orderId: { type: Schema.Types.ObjectId, ref: "Order", default: null },
        images: { type: [reviewImageSchema], default: [] },
        userId: { type: Number, required: true, index: true },
        userName: { type: String, required: true },
        userEmail: { type: String, default: null },

        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true, trim: true, maxlength: 1000 },

        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        isDeleted: { type: Boolean, default: false },

        reply: { type: reviewReplySchema, default: undefined },
    },
    { timestamps: true }
);

export const Review =
    (mongoose.models.Review as mongoose.Model<IReview>) ||
    mongoose.model<IReview>("Review", reviewSchema);
