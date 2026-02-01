/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */

import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { ensureRole, normalizeCode } from "./coupon.utils";
import { Coupon } from "./coupon.model";
import mongoose from "mongoose";

export const createCouponIntoDb = async (payload: any, user: JwtPayload) => {
    const role = (user as any)?.role;
    const adminId = user?._id;

    ensureRole(role, ["admin", "superAdmin"]);
    if (!adminId) throw new AppError(httpStatus.UNAUTHORIZED, "Invalid admin");

    const code = normalizeCode(payload.code);

    const exists = await Coupon.findOne({ code, isDeleted: false });
    if (exists) throw new AppError(httpStatus.CONFLICT, "Coupon already exists");

    // scope consistency
    const scope = payload.scope || "global";
    if (scope === "products") {
        if (!Array.isArray(payload.productIds) || payload.productIds.length === 0) {
            throw new AppError(httpStatus.BAD_REQUEST, "productIds required for products scope");
        }
    }
    if (scope === "categories") {
        if (!Array.isArray(payload.categoryIds) || payload.categoryIds.length === 0) {
            throw new AppError(httpStatus.BAD_REQUEST, "categoryIds required for categories scope");
        }
    }

    if (payload.type === "percentage" && payload.value > 100) {
        throw new AppError(httpStatus.BAD_REQUEST, "Percentage cannot exceed 100");
    }

    // date rules
    if (payload.startDate && payload.endDate) {
        const start = new Date(payload.startDate);
        const end = new Date(payload.endDate);
        if (end < start) throw new AppError(httpStatus.BAD_REQUEST, "endDate must be after startDate");
    }

    const doc = {
        ...payload,
        adminId,          // ✅ secure
        name: payload.name,
        code,
        scope,
    };

    const result = await Coupon.create(doc);
    return result;
};

export const getCouponsFromDb = async (user: JwtPayload, query: any) => {
    const role = (user as any)?.role;
    ensureRole(role, ["admin", "superAdmin"]);

    const page = Math.max(Number(query?.page || 1), 1);
    const limit = Math.min(Math.max(Number(query?.limit || 10), 1), 100);
    const skip = (page - 1) * limit;

    const sort = (query?.sort as string)?.split(",").join(" ") || "-createdAt";
    const searchTerm = (query?.searchTerm as string)?.trim();
    const scope = query?.scope || "all";
    const isActive = query?.isActive || "all";

    const filter: any = { isDeleted: false };

    if (scope !== "all") filter.scope = scope;
    if (isActive !== "all") filter.isActive = isActive === "true";

    if (searchTerm) {
        filter.$or = [
            { code: { $regex: searchTerm, $options: "i" } },
            { name: { $regex: searchTerm, $options: "i" } },
        ];
    }

    const [items, total] = await Promise.all([
        Coupon.find(filter).sort(sort).skip(skip).limit(limit),
        Coupon.countDocuments(filter),
    ]);

    return {
        items,
        meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    };
};

export const updateCouponIntoDB = async (couponId: string, payload: any, user: JwtPayload) => {
    const role = (user as any)?.role;
    ensureRole(role, ["admin", "superAdmin"]);

    if (!mongoose.Types.ObjectId.isValid(couponId)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid couponId");
    }

    const coupon = await Coupon.findOne({ _id: couponId, isDeleted: false });
    if (!coupon) throw new AppError(httpStatus.NOT_FOUND, "Coupon not found");

    // protect code
    if (payload.code) throw new AppError(httpStatus.BAD_REQUEST, "Coupon code cannot be updated");

    // validate scope consistency
    const nextScope = payload.scope ?? coupon.scope;

    if (nextScope === "products") {
        const nextProducts = payload.productIds ?? coupon.productIds;
        if (!Array.isArray(nextProducts) || nextProducts.length === 0) {
            throw new AppError(httpStatus.BAD_REQUEST, "productIds required for products scope");
        }
    }

    if (nextScope === "categories") {
        const nextCats = payload.categoryIds ?? coupon.categoryIds;
        if (!Array.isArray(nextCats) || nextCats.length === 0) {
            throw new AppError(httpStatus.BAD_REQUEST, "categoryIds required for categories scope");
        }
    }

    // percentage rule
    const nextType = payload.type ?? coupon.type;
    const nextValue = payload.value ?? coupon.value;
    if (nextType === "percentage" && nextValue > 100) {
        throw new AppError(httpStatus.BAD_REQUEST, "Percentage cannot exceed 100");
    }

    // date rules
    const start = payload.startDate ? new Date(payload.startDate) : coupon.startDate;
    const end = payload.endDate ? new Date(payload.endDate) : coupon.endDate;
    if (start && end && end < start) {
        throw new AppError(httpStatus.BAD_REQUEST, "endDate must be after startDate");
    }

    Object.assign(coupon, payload);

    const result = await coupon.save();
    return result;
};

export const deleteCouponFromDB = async (couponId: string, user: JwtPayload) => {
    const role = (user as any)?.role;
    ensureRole(role, ["admin", "superAdmin"]);

    const coupon = await Coupon.findOne({ _id: couponId, isDeleted: false });
    if (!coupon) throw new AppError(httpStatus.NOT_FOUND, "Coupon not found");

    coupon.isDeleted = true;
    coupon.isActive = false;

    const result = await coupon.save();
    return result;
};

export const toggleCouponActiveFromDB = async (couponId: string, user: JwtPayload) => {
    const role = (user as any)?.role;
    ensureRole(role, ["admin", "superAdmin"]);

    const coupon = await Coupon.findOne({ _id: couponId, isDeleted: false });
    if (!coupon) throw new AppError(httpStatus.NOT_FOUND, "Coupon not found");

    coupon.isActive = !coupon.isActive;

    const result = await coupon.save();
    return result;
};

export const applyCouponFromDB = async (
    payload: { code: string; cartTotal: number; productIds?: string[]; categoryIds?: string[] },
    user: JwtPayload
) => {
    const userId = user?._id;
    if (!userId) throw new AppError(httpStatus.UNAUTHORIZED, "Invalid user");

    const code = normalizeCode(payload.code);

    const coupon = await Coupon.findOne({ code, isDeleted: false, isActive: true });
    if (!coupon) throw new AppError(httpStatus.NOT_FOUND, "Invalid coupon");

    const now = new Date();

    if (coupon.startDate && now < coupon.startDate) throw new AppError(httpStatus.BAD_REQUEST, "Coupon not started yet");
    if (coupon.endDate && now > coupon.endDate) throw new AppError(httpStatus.BAD_REQUEST, "Coupon expired");



    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw new AppError(httpStatus.BAD_REQUEST, "Coupon usage limit reached");
    }

    // per-user limit check
    const userUsedCount = coupon.usedBy.filter((u) => u.userId.toString() === userId.toString()).length;
    if (coupon.perUserLimit && userUsedCount >= coupon.perUserLimit) {
        throw new AppError(httpStatus.BAD_REQUEST, "You already used this coupon");
    }

    // scope checks
    if (coupon.scope === "products") {
        const list = payload.productIds || [];
        if (list.length === 0) throw new AppError(httpStatus.BAD_REQUEST, "productIds required");
        const couponProducts = (coupon.productIds || []).map((id) => id.toString());
        const ok = list.some((pid) => couponProducts.includes(pid));
        if (!ok) throw new AppError(httpStatus.BAD_REQUEST, "Coupon not valid for these products");
    }

    if (coupon.scope === "categories") {
        const list = payload.categoryIds || [];
        if (list.length === 0) throw new AppError(httpStatus.BAD_REQUEST, "categoryIds required");
        const couponCats = (coupon.categoryIds as unknown as any[] || []).map((id) => id.toString());
        const ok = list.some((cid) => couponCats.includes(cid));
        if (!ok) throw new AppError(httpStatus.BAD_REQUEST, "Coupon not valid for these categories");
    }

    // calculate discount
    let discount = 0;

    if (coupon.type === "percentage") {
        discount = (payload.cartTotal * coupon.value) / 100;

    } else {
        discount = coupon.value;
    }

    discount = Math.min(discount, payload.cartTotal);

    return {
        couponId: coupon._id,
        code: coupon.code,
        discount,
        finalAmount: Math.max(payload.cartTotal - discount, 0),
        type: coupon.type,
        value: coupon.value,
    };
};

export const consumeCouponFromDB = async (
    payload: { couponId: string; orderId?: string },
    user: JwtPayload
) => {
    const userId = user?._id;
    if (!userId) throw new AppError(httpStatus.UNAUTHORIZED, "Invalid user");

    const { couponId, orderId } = payload;

    if (!mongoose.Types.ObjectId.isValid(couponId)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid couponId");
    }
    if (orderId && !mongoose.Types.ObjectId.isValid(orderId)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid orderId");
    }

    const coupon = await Coupon.findOne({ _id: couponId, isDeleted: false, isActive: true });
    if (!coupon) throw new AppError(httpStatus.NOT_FOUND, "Coupon not found");

    await Coupon.updateOne(
        { _id: couponId },
        {
            $inc: { usedCount: 1 },
            $push: { usedBy: { userId, usedAt: new Date(), orderId: orderId || null } },
        }
    );

    return { success: true };
};

export const CouponService = {
    createCouponIntoDb,
    getCouponsFromDb,
    updateCouponIntoDB,
    deleteCouponFromDB,
    toggleCouponActiveFromDB,
    applyCouponFromDB,
    consumeCouponFromDB,
};
