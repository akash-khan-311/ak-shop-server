import z from 'zod'

export const createProductSchema = z.object({
  body: z.object({
    productName: z.string().min(1),
    category: z.string().min(1),
    subcategory: z.string().min(1),

    categorySlug: z.string().min(1),
    subcategorySlug: z.string().min(1),

    brand: z.string().min(1),
    color: z.string().min(1),

    weight: z.string().optional(),
    length: z.string().optional(),
    width: z.string().optional(),

    description: z.string().optional(),

    quantity: z.string().min(1),
    availability: z.enum(['In Stock', 'Out of Stock']),

    userId: z.string().min(1),

    specifications: z.string().optional() // 👈 JSON string
  })
})

export const ProductValidation = { createProductSchema }
