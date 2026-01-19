import z from 'zod'

export const subCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    brands: z.array(z.string())
  })
})
export const createCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    subcategories: z.array(subCategoryValidationSchema).optional()
  })
})

export const updateStatusValidationSchema = z.object({
  body: z.object({
    isPublished: z.boolean()
  })
})

export const updateCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    subcategories: z.array(subCategoryValidationSchema).optional()
  })
})

export const CategoryValidation = {
  createCategoryValidationSchema,
  updateCategoryValidationSchema,
  subCategoryValidationSchema,
  updateStatusValidationSchema
}
