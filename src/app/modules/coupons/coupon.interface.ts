/* eslint-disable prettier/prettier */
import { Types } from "mongoose"

export type TCouponType = 'percentage' | 'fixed'
export type TCouponScope = "global" | "products" | 'categories';
export type TCouponUsedBy = {
    userId: Types.ObjectId;
    usedAt: Date;
    orderId?: Types.ObjectId | null
}

export type TCoupon = {
    adminId: Types.ObjectId;
    name: string;
    code: string;
    type: TCouponType;
    value: number;
    scope: TCouponScope;
    categoryIds?: Types.ObjectId | null;
    productIds?: Types.ObjectId[];
    startDate?: Date | null;
    endDate?: Date | null;
    usageLimit?: number | null;
    perUserLimit?: number | null;
    usedCount: number;
    usedBy: TCouponUsedBy[];
    isActive: boolean;
    isDeleted: boolean;
}