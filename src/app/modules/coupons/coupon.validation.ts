/* eslint-disable prettier/prettier */
import { z } from "zod";
const numOptional = z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.number()
);
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

const createCouponSchema = z.object({
    body: z.object({
        name: z.string().min(2).max(60),
        code: z.string().min(3).max(30),

        type: z.enum(["percentage", "fixed"]),

        value: z.coerce.number().positive(),


        scope: z.enum(["global", "products", "categories"]).default("global"),

        productIds: z.array(objectId).optional(),
        categoryIds: z.array(objectId).optional(),

        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),

        usageLimit: z.coerce.number().positive().optional(),
        perUserLimit: z.coerce.number().positive().optional(),

        isActive: z.coerce.boolean().optional(),
    }),
});

const updateCouponSchema = z.object({
    params: z.object({
        couponId: objectId,
    }),
    body: z.object({
        name: z.string().min(2).max(60).optional(),


        type: z.enum(["percentage", "fixed"]).optional(),

        value: z.coerce.number().positive().optional(),
        usageLimit: numOptional.refine((value) => value > 0, {
            message: 'Usage limit must be positive',
        }).optional(),
        perUserLimit: numOptional.refine((value) => value > 0, {
            message: 'Per user limit must be positive',
        }).optional(),

        scope: z.enum(["global", "products", "categories"]).optional(),

        productIds: z.array(objectId).optional(),
        categoryIds: z.array(objectId).optional(),

        startDate: z.string().datetime().optional().nullable(),
        endDate: z.string().datetime().optional().nullable(),



        isActive: z.coerce.boolean().optional(),
    }),
});

const getCouponsSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        sort: z.string().optional(),
        searchTerm: z.string().optional(),
        scope: z.enum(["global", "products", "categories", "all"]).optional(),
        isActive: z.enum(["true", "false", "all"]).optional(),
    }),
});

const applyCouponSchema = z.object({
    body: z.object({
        code: z.string().min(3).max(30),
        cartTotal: z.coerce.number().min(0),
        productIds: z.array(objectId).optional(),
        categoryIds: z.array(objectId).optional(),
    }),
});

const consumeCouponSchema = z.object({
    body: z.object({
        couponId: objectId,
        orderId: objectId.optional(),
    }),
});

export const CouponValidation = {
    createCouponSchema,
    updateCouponSchema,
    getCouponsSchema,
    applyCouponSchema,
    consumeCouponSchema,
};
