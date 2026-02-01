/* eslint-disable prettier/prettier */
import { model, Schema } from "mongoose";
import { TCoupon, TCouponUsedBy } from "./coupon.interface";

const usedBySchema = new Schema<TCouponUsedBy>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    usedAt: { type: Date, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: false }
}, { _id: false })

const couponSchema = new Schema<TCoupon>({
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // ✅ required

    name: { type: String, required: true, trim: true },

    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true,
    },

    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true },



    scope: {
        type: String,
        enum: ["global", "products", "categories"], // ✅ vendor বাদ
        required: true,
        default: "global",
    },

    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }], // default []
    categoryIds: [{ type: Schema.Types.ObjectId, ref: "Category" }], // default []

    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },

    usageLimit: { type: Number, default: null },
    perUserLimit: { type: Number, default: 1 },

    usedCount: { type: Number, default: 0 },
    usedBy: { type: [usedBySchema], default: [] },

    isActive: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
},
    { timestamps: true })


couponSchema.index({ code: 1, isDeleted: 1 });
export const Coupon = model<TCoupon>("Coupon", couponSchema);