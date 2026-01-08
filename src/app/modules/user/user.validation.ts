/* eslint-disable prettier/prettier */
import z from 'zod'

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address').optional(),
    phone: z
      .string()
      .min(10, 'Phone number must be at least 10 digits')
      .optional(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .optional()
  })
  .superRefine((data, ctx) => {
    // Either email or phone or password must exist for local signup
    if (!data.email && !data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Either email or phone number is required'
      })
    }

    // If email exists, password is required
    if (data.email && !data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password is required when email is provided'
      })
    }
  })

export const socialLoginSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  provider: z.enum(['google', 'facebook']).pipe(
    z.enum(['google', 'facebook'], {
      errorMap: () => ({ message: 'Provider must be Google or Facebook' })
    })
  ),
  providerId: z.string().min(1, 'Provider ID is required')
})
export const UserValidation = {
  registerSchema
}
