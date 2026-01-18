import z from 'zod'

export const loginSchema = z
  .object({
    body: z.object({
      email: z.string().email('Invalid email').optional(),
      phone: z.string().min(10, 'Phone must be valid').optional(),
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
  })

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: 'Refresh Token is required'
    })
  })
})
const forgetPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required'
    })
  })
})

const resetPasswordValidationSchema = z.object({
  body: z.object({
    id: z.string({
      required_error: 'User Id is required'
    }),
    newPassword: z.string({
      required_error: 'Password is required'
    })
  })
})

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string({
      required_error: 'Old Password is required'
    }),
    newPassword: z.string({
      required_error: ' Password is required'
    })
  })
})

export const AuthValidation = {
  loginSchema,
  refreshTokenValidationSchema,
  forgetPasswordValidationSchema,
  changePasswordValidationSchema
}
