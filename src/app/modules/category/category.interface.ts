export type TBrand = string
export type TCategoryImage = {
  url: string
  public_id: string
}
export type TSubCategory = {
  _id?: string
  name: string
  slug: string
  brands: TBrand[]
}

export type Slug = string
export type TCategory = {
  _id?: string
  image?: TCategoryImage
  name: string
  slug: Slug
  subcategories?: TSubCategory[]
  isDeleted?: boolean
  published?: boolean
}
