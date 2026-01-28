import mongoose, { Schema } from 'mongoose'
const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true }
  },
  { _id: false }
)
const productSchema = new Schema(
  {
    productName: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    images: { type: [imageSchema], default: [] },
    categorySlug: {
      type: String,
      required: true,
      lowercase: true,
      index: true
    },
    subcategorySlug: {
      type: String,
      required: true,
      lowercase: true,
      index: true
    },

    vendorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Vendor',
      index: true
    },

    brand: { type: String, required: true },
    color: { type: String, required: true },
    weight: { type: Number },
    length: { type: Number },
    width: { type: Number },
    description: { type: String },
    isDeleted: { type: Boolean, default: false },
    quantity: { type: Number, required: true },
    availability: {
      type: String,
      enum: ['In Stock', 'Out of Stock'],
      required: true
    },

    specifications: { type: Schema.Types.Mixed, default: {} },

    specIndex: {
      type: [{ k: { type: String }, v: { type: String } }],
      default: [],
      index: true
    }
  },
  { timestamps: true }
)

productSchema.index({ 'specIndex.k': 1, 'specIndex.v': 1 })

export type TProductDocument = mongoose.InferSchemaType<typeof productSchema>

const existing = (
  mongoose.models as unknown as Record<string, mongoose.Model<TProductDocument>>
).Product

export const Product =
  existing || mongoose.model<TProductDocument>('Product', productSchema)
