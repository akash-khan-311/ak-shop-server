export type TSpecValue = string | number | boolean | string[] | number[]
export type TProductImages = {
  url: string
  public_id: string
}
export type TProduct = {
  productName: string
  category: string
  subcategory: string
  image?: TProductImages[]
  categorySlug: string
  subcategorySlug: string

  brand: string
  color: string
  weight?: number
  length?: number
  width?: number
  description?: string

  quantity: number
  availability: 'In Stock' | 'Out of Stock'

  userId: string
  specifications: Record<string, TSpecValue>
}
