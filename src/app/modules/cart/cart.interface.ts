import mongoose from 'mongoose'
export type CartOwnerType = 'user' | 'vendor'
export type ICartItem = {
  productId: mongoose.Types.ObjectId
  quantity: number
  variantId?: string | null
}

export type ICart = {
  _id?: string
  ownerType: CartOwnerType
  userId?: mongoose.Types.ObjectId
  guestId?: string | null
  items: ICartItem[]
  createdAt?: Date
  updatedAt?: Date
}
