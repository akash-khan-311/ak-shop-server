import mongoose, { Schema } from 'mongoose'

// Avoid generic Schema<T> here — it can trigger "union type too complex" in TS.
const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      lowercase: true
    },
    brands: {
      type: [String],
      default: []
    },
    image: { url: String, public_id: String },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { _id: true }
)

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    image: { url: String, public_id: String },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    subcategories: {
      type: [subCategorySchema],

      default: []
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    published: {
      type: Boolean,
      default: false
    }
  },

  { timestamps: true }
)

export type TCategoryDocument = mongoose.InferSchemaType<typeof categorySchema>

const existingCategoryModel = (
  mongoose.models as unknown as Record<
    string,
    mongoose.Model<TCategoryDocument>
  >
).Category

export const Category =
  existingCategoryModel ||
  mongoose.model<TCategoryDocument>('Category', categorySchema)
