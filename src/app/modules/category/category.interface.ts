export type TBrand = string
export type TSubCategory = {
  _id?: string
  name: string
  slug: string
  brands: TBrand[]
}

export type Slug = string
export type TCategory = {
  _id?: string
  image: string
  name: string
  slug: Slug
  subcategories: TSubCategory[]
  isDeleted?: boolean
  published?: boolean
}
