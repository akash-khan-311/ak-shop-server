/* eslint-disable prettier/prettier */
import z from 'zod'

export const addressSchema = z.object({
  division: z.string().optional(),
  district: z.string().optional(),
  upazila: z.string().optional(),
  union: z.string().optional(),
  fullAddress: z.string().optional()
})
export const registerSchema = z
  .object({
    body: z.object({
      name: z.string().min(2, 'Name is required'),
      email: z.string().email('Invalid email'),
      phone: z.string().min(11, 'Phone must be valid'),
      password: z.string().min(8, 'Password must be at least 8 characters')
    })
  })
  .superRefine((data, ctx) => {
    if (!data.body.email && !data.body.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Email or phone is required'
      })
    }

    if (data.body.email && !data.body.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password is required when email is used'
      })
    }
  })

export const getSingleUserSchema = z.object({
  params: z.object({
    identifier: z
      .string()
      .min(3, 'Identifier is required')
      .refine(
        value =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
          /^[0-9]{10,15}$/.test(value),
        {
          message: 'Must be a valid email or phone number'
        }
      )
  })
})

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    avatar: z.string().url().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    address: z
      .object({
        division: z.string().optional(),
        district: z.string().optional(),
        upazila: z.string().optional(),
        union: z.string().optional(),
        fullAddress: z.string().optional()
      })
      .optional()
  })
})

export const addAddressSchema = z.object({
  body: z.object({
    label: z.string().min(1).max(50).optional(),
    type: z.enum(['shipping', 'billing'], {
      required_error: 'Address type is required'
    }),

    division: z.string().optional(),
    district: z.string().optional(),
    upazila: z.string().optional(),
    union: z.string().optional(),

    fullAddress: z
      .string({ required_error: 'Full address is required' })
      .min(5, 'Full address must be at least 5 characters')
      .max(300, 'Full address is too long'),

    phone: z.string().min(7).max(20).optional(),
    isDefault: z.boolean().optional()
  })
})


export const removeAddressSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User id is required'),
    addressId: z.string().min(1, 'Address id is required')
  })
})


export const setDefaultAddressSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User id is required'),
    addressId: z.string().min(1, 'Address id is required'),
    type: z.enum(['shipping', 'billing'])
  })
})


export const updateAvatarSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User id is required')
  })
})
export const UserValidation = {
  getSingleUserSchema,
  registerSchema,
  updateProfileSchema,
  addressSchema,
  addAddressSchema,
  removeAddressSchema,
  updateAvatarSchema,
  setDefaultAddressSchema
}
