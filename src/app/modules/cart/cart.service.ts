/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from '../../errors/AppError'
import httpStatus from 'http-status'
import { Cart } from './cart.model'
import mongoose from 'mongoose'
import { findOrCreateCart, getCartDetailsViewFromDB } from './cart.utils'
import { matchItem } from '../../helpers'

export const getMyCartFromDB = async (owner: {
  userId?: string | null
  guestIdForCartItem?: string | null
}) => {
  await findOrCreateCart(owner)
  const detailed = await getCartDetailsViewFromDB(owner)
  return detailed || { items: [] }
}

export const addToCartIntoDB = async (
  owner: { userId?: string | null; guestIdForCartItem?: string | null },
  payload: { productId: string; quantity: number; variantId?: string | null },
) => {
  const cart = await findOrCreateCart(owner)

  if (!cart.items) cart.items = []

  const idx = cart.items.findIndex((i: any) =>
    matchItem(i, payload.productId, payload.variantId),
  )

  if (idx >= 0) cart.items[idx].quantity += payload.quantity
  else
    cart.items.push({
      productId: new mongoose.Types.ObjectId(payload.productId),
      quantity: payload.quantity,
      variantId: payload.variantId || null,
    } as any)

  await cart.save()
  const detailed = await getCartDetailsViewFromDB(owner)
  return detailed
}

export const updateCartItemIntoDB = async (
  owner: { userId?: string | null; guestIdForCartItem?: string | null },
  payload: { productId: string; quantity: number; variantId?: string | null },
) => {
  const cart = await findOrCreateCart(owner)

  const idx = cart.items.findIndex((i: any) =>
    matchItem(i, payload.productId, payload.variantId),
  )
  if (idx < 0) throw new AppError(httpStatus.NOT_FOUND, 'Cart item not found')

  cart.items[idx].quantity = payload.quantity
  await cart.save()

  const detailed = await getCartDetailsViewFromDB(owner)
  return detailed
}

export const removeCartItemFromDB = async (
  owner: { userId?: string | null; guestIdForCartItem?: string | null },
  payload: { productId: string; variantId?: string | null },
) => {
  const cart = await findOrCreateCart(owner)

  cart.items = cart.items.filter(
    (i: any) => !matchItem(i, payload.productId, payload.variantId),
  ) as any
  await cart.save()
  const detailed = await getCartDetailsViewFromDB(owner)
  return detailed
}
export const clearCartFromDB = async (owner: {
  userId?: string | null
  guestIdForCartItem?: string | null
}) => {
  const cart = await findOrCreateCart(owner)
  cart.items = [] as any
  await cart.save()
  const detailed = await getCartDetailsViewFromDB(owner)
  return detailed
}
export const mergeGuestCartToUserCartFromDB = async (params: {
  userId: string
  guestIdForCartItem: string
}) => {
  const { userId, guestIdForCartItem } = params

  const guestCart = await Cart.findOne({
    ownerType: 'guest',
    guestIdForCartItem,
  })
  if (!guestCart || guestCart.items.length === 0) {
    return { merged: false }
  }

  const userCart = await findOrCreateCart({ userId, guestIdForCartItem: null })

  for (const gItem of guestCart.items as any[]) {
    const idx = userCart.items.findIndex((u: any) =>
      matchItem(u, gItem.productId.toString(), gItem.variantId || null),
    )
    if (idx >= 0) userCart.items[idx].quantity += gItem.quantity
    else userCart.items.push(gItem as any)
  }

  await userCart.save()
  await Cart.deleteOne({ ownerType: 'guest', guestIdForCartItem })

  const detailed = await getCartDetailsViewFromDB({
    userId,
    guestIdForCartItem: null,
  })
  return { merged: true, cart: detailed }
}
export const CartService = {
  getMyCartFromDB,
  addToCartIntoDB,
  updateCartItemIntoDB,
  removeCartItemFromDB,
  clearCartFromDB,
  mergeGuestCartToUserCartFromDB,
}
