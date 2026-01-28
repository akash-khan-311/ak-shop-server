import z from 'zod'

const fieldSchema = z
  .object({
    label: z.string().min(1),
    name: z.string().min(1),
    type: z.enum([
      'text',
      'number',
      'date',
      'combobox',
      'boolean',
      'multi-select'
    ]),
    options: z.array(z.string()).optional(),
    unit: z.string().optional(),
    order: z.number().optional()
  })
  .superRefine((val, ctx) => {
    if (
      (val.type === 'combobox' || val.type === 'multi-select') &&
      (!val.options || val.options.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${val.name} options required`
      })
    }
  })

export const createSpecTemplateSchema = z.object({
  body: z.object({
    categorySlug: z.string().optional(),
    subcategorySlug: z.string().min(1),
    userId: z.string().optional().nullable(), // null => base
    fields: z.array(fieldSchema).default([]),
    isPublished: z.boolean().optional()
  })
})
export const updateSpecTemplateSchema = z.object({
  body: z.object({
    categorySlug: z.string().optional(),
    subcategorySlug: z.string().min(1).optional(),
    userId: z.string().optional().nullable().optional(), // null => base
    fields: z.array(fieldSchema).default([]).optional(),
    isPublished: z.boolean().optional()
  })
})

export const getEffectiveTemplateSchema = z.object({
  params: z.object({
    subcategorySlug: z.string().min(1)
  }),
  query: z.object({
    userId: z.string().optional()
  })
})

export const deleteSpecTemplateSchema = z.object({
  body: z.object({
    ids: z.array(z.string().min(1)).min(1)
  })
})

export const SpecTemplateValidation = {
  createSpecTemplateSchema,
  getEffectiveTemplateSchema,
  updateSpecTemplateSchema,
  deleteSpecTemplateSchema
}
