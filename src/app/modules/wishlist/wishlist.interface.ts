import mongoose from 'mongoose'

export type TWishlistOwnerType = 'user' | 'guest'

export type TWishlistItem = {
  productId: mongoose.Types.ObjectId
  variantId?: string | null
  addedAt?: Date
}

export type TWishlist = {
  _id?: string
  ownerType: TWishlistOwnerType

  userId?: mongoose.Types.ObjectId | null
  guestIdForWishlist?: string | null

  items: TWishlistItem[]

  isDeleted: boolean

  createdAt?: Date
  updatedAt?: Date
}
