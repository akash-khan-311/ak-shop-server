import mongoose from 'mongoose'
export type CartOwnerType = 'user' | 'guest'
export type ICartItem = {
  productId: mongoose.Types.ObjectId
  quantity: number
  variantId?: string | null
}

export type ICart = {
  _id?: string
  ownerType: CartOwnerType
  userId?: mongoose.Types.ObjectId | null
  guestIdForCartItem?: string | null
  items: ICartItem[]
  createdAt?: Date
  updatedAt?: Date
}
