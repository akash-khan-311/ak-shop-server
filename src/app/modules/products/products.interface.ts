/* eslint-disable prettier/prettier */
import mongoose from "mongoose"

export type TSpecValue = string | number | boolean | string[] | number[]
export type TProductImages = {
  url: string
  public_id: string
}
export type TProduct = {
  productName: string
  category: string
  subcategory: string
  images?: TProductImages[]
  categorySlug: string
  subcategorySlug: string
  status: 'active' | 'inactive'
  brand: string
  color: string
  weight?: number
  length?: number
  width?: number
  description?: string
  isPublished: boolean,
  quantity: number
  availability: 'In Stock' | 'Out of Stock'
  isDeleted: boolean
  adminId: mongoose.Types.ObjectId
  specifications: Record<string, TSpecValue>
}
