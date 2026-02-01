/* eslint-disable prettier/prettier */
import mongoose from "mongoose";

export interface IReviewImage {
    url: string;
    public_id: string;
}
export interface IReviewReply {
    message: string;
    repliedBy: "vendor" | "admin";
    repliedAt: Date;
}

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface IReview {
    _id?: string;

    productId: mongoose.Types.ObjectId;
    adminId: mongoose.Types.ObjectId;
    orderId?: mongoose.Types.ObjectId;

    userId: number;
    userName: string;
    userEmail?: string;
    images?: IReviewImage[];
    rating: 1 | 2 | 3 | 4 | 5;
    comment: string;

    status: ReviewStatus;
    isDeleted: boolean;

    reply?: IReviewReply;

    createdAt?: Date;
    updatedAt?: Date;
}