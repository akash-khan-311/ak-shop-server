import mongoose, { Schema } from 'mongoose'
import { TCategory, TSubCategory } from './category.interface'

const subCategorySchema = new Schema<TSubCategory>(
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
    }
  },
  { _id: true }
)

const categorySchema = new Schema<TCategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    image: { type: String, required: true },
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

export const Category =
  mongoose.models.Category || mongoose.model('Category', categorySchema)
