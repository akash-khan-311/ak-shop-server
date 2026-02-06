export type TCheckoutLineItem = {
  productId: string
  variantId?: string | null
  image?: string | null
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type TCheckoutSummary = {
  items: TCheckoutLineItem[]
  subtotal: number
  shippingCharge: number
  tax: number
  discount: number
  total: number
}
