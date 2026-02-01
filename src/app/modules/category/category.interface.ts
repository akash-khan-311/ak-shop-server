import { Types } from 'mongoose'

export type TBrand = string
export type TSubCategoryImage = {
  url: string
  public_id: string
}

export type TCategoryImage = {
  url: string
  public_id: string
}
export type TSubCategory = {
  _id?: string
  name: string
  adminId: Types.ObjectId
  slug: string
  image?: TSubCategoryImage
  brands: TBrand[]
  isDeleted?: boolean
}

export type Slug = string
export type TCategory = {
  _id?: string
  adminId: Types.ObjectId
  image?: TCategoryImage
  name: string
  slug: Slug
  subcategories?: TSubCategory[]
  isDeleted?: boolean
  published?: boolean
}
