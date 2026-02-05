import z from 'zod'

const addToWishListValidationSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'ProductId is required'),
    variantId: z.string().trim().min(1).optional().nullable(),
  }),
})

const removeWishListItemValidationSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'ProductId is required'),
    variantId: z.string().trim().min(1).optional().nullable(),
  }),
})

const mergeWishListValidationSchema = z.object({
  body: z.object({
    guestId: z.string().min(1, 'guestId is required'),
  }),
})

export const WishlistValidation = {
  addToWishListValidationSchema,
  removeWishListItemValidationSchema,
  mergeWishListValidationSchema,
}
