import { z } from 'zod'

export const addToCartValidationSchema = z.object({
  body: z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1).max(999).default(1),
    variantId: z.string().trim().min(1).optional().nullable(),
  }),
})

export const updateCartItemValidationSchema = z.object({
  body: z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1).max(999),
    variantId: z.string().trim().min(1).optional().nullable(),
  }),
})

export const removeCartItemValidationSchema = z.object({
  body: z.object({
    productId: z.string().min(1),
    variantId: z.string().trim().min(1).optional().nullable(),
  }),
})
const mergeGuestCartValidationSchema = z.object({
  body: z.object({
    guestIdForCartItem: z.string().min(1, 'guestId for cart is required'),
  }),
})

export const cartValidation = {
  addToCartValidationSchema,
  updateCartItemValidationSchema,
  removeCartItemValidationSchema,
  mergeGuestCartValidationSchema,
}
