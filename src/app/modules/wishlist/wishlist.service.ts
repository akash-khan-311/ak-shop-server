/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose'
import { Wishlist } from './wishlist.model'
import {
  findOrCreateWishlist,
  getWishlistDetailsViewFromDB,
} from './wishlist.utils'
import { matchItem } from '../../helpers'

export const getMyWishlistFromDB = async (owner: {
  userId?: string | null
  guestIdForWishlist?: string | null
}) => {
  await findOrCreateWishlist(owner)
  return await getWishlistDetailsViewFromDB(owner)
}

export const addToWishlistIntoDB = async (
  owner: { userId?: string | null; guestIdForWishlist?: string | null },
  payload: { productId: string; variantId?: string | null },
) => {
  const wishlist = await findOrCreateWishlist(owner)

  const idx = wishlist.items.findIndex((i: any) =>
    matchItem(i, payload.productId, payload.variantId),
  )
  if (idx >= 0) {
    return await getWishlistDetailsViewFromDB(owner)
  }

  wishlist.items.push({
    productId: new mongoose.Types.ObjectId(payload.productId),
    variantId: payload.variantId || null,
    addedAt: new Date(),
  } as any)

  await wishlist.save()
  return await getWishlistDetailsViewFromDB(owner)
}
export const removeWishlistItemFromDB = async (
  owner: { userId?: string | null; guestIdForWishlist?: string | null },
  payload: { productId: string; variantId?: string | null },
) => {
  const wishlist = await findOrCreateWishlist(owner)

  wishlist.items = wishlist.items.filter(
    (i: any) => !matchItem(i, payload.productId, payload.variantId),
  ) as any

  await wishlist.save()
  return await getWishlistDetailsViewFromDB(owner)
}

export const clearWishlistFromDB = async (owner: {
  userId?: string | null
  guestIdForWishlist?: string | null
}) => {
  const wishlist = await findOrCreateWishlist(owner)
  wishlist.items = [] as any
  await wishlist.save()
  return await getWishlistDetailsViewFromDB(owner)
}
export const mergeGuestWishlistToUserWishlistFromDB = async (params: {
  userId: string
  guestIdForWishlist: string
}) => {
  const { userId, guestIdForWishlist } = params

  const guestWishlist = await Wishlist.findOne({
    ownerType: 'guest',
    guestIdForWishlist,
    isDeleted: false,
  })
  if (!guestWishlist || guestWishlist.items.length === 0) {
    return { merged: false }
  }

  const userWishlist = await findOrCreateWishlist({
    userId,
    guestIdForWishlist: null,
  })

  for (const gItem of guestWishlist.items as any[]) {
    const exists = userWishlist.items.some(
      (u: any) =>
        u.productId.toString() === gItem.productId.toString() &&
        (u.variantId || null) === (gItem.variantId || null),
    )
    if (!exists) userWishlist.items.push(gItem as any)
  }

  await userWishlist.save()
  await Wishlist.deleteOne({ ownerType: 'guest', guestIdForWishlist })

  const detailed = await getWishlistDetailsViewFromDB({
    userId,
    guestIdForWishlist: null,
  })
  return { merged: true, wishlist: detailed }
}

export const WishlistService = {
  getMyWishlistFromDB,
  addToWishlistIntoDB,
  removeWishlistItemFromDB,
  clearWishlistFromDB,
  mergeGuestWishlistToUserWishlistFromDB,
}
