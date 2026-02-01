import mongoose, { Schema } from 'mongoose'

const specFieldSchema = new Schema(
  {
    label: { type: String, required: true },
    name: { type: String, required: true, lowercase: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['text', 'number', 'date', 'combobox', 'boolean', 'multi-select']
    },
    options: { type: [String], default: [] },
    optional: { type: Boolean, default: false },
    unit: { type: String },
    order: { type: Number, default: 0 }
  },
  { _id: false }
)

const specTemplateSchema = new Schema(
  {
    categorySlug: { type: String },
    subcategorySlug: {
      type: String,
      required: true,
      lowercase: true,
      index: true
    },

    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    fields: { type: [specFieldSchema], default: [] },

    isPublished: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

specTemplateSchema.index({ subcategorySlug: 1, userId: 1 }, { unique: true })

export type TSpecTemplateDocument = mongoose.InferSchemaType<
  typeof specTemplateSchema
>

const existing = (
  mongoose.models as unknown as Record<
    string,
    mongoose.Model<TSpecTemplateDocument>
  >
).SpecTemplate

export const SpecTemplate =
  existing ||
  mongoose.model<TSpecTemplateDocument>('SpecTemplate', specTemplateSchema)
