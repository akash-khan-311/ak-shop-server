import { z } from 'zod'

const checkoutSummaryValidationSchema = z.object({
  query: z
    .object({
      coupon: z.string().optional(),
      shipping: z.enum(['standard', 'express']).optional(),
    })
    .optional(),
})

export const CheckoutValidation = {
  checkoutSummaryValidationSchema,
}
