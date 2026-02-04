/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from '../../errors/AppError'
import httpStatus from 'http-status'
import { Cart } from './cart.model'
import mongoose from 'mongoose'

const findCartByOwner = async (owner: {
  userId?: string | null
  guestId?: string | null
}) => {
  if (owner.userId) {
    return Cart.findOne({
      ownerType: 'user',
      userId: new mongoose.Types.ObjectId(owner.userId),
    })
  }
  if (owner.guestId) {
    return Cart.findOne({
      ownerType: 'guest',
      guestId: owner.guestId,
    })
  }
  return null
}

const createCartForOwner = async (owner: {
  userId?: string | null
  guestId?: string | null
}) => {
  if (owner.userId) {
    return Cart.create({
      ownerType: 'user',
      userId: new mongoose.Types.ObjectId(owner.userId),
      guestId: null,
      items: [],
    })
  }

  if (owner.guestId) {
    return Cart.create({
      ownerType: 'guest',
      userId: null,
      guestId: owner.guestId,
      items: [],
    })
  }

  throw new AppError(
    httpStatus.BAD_REQUEST,
    'Cart owner not found (userId/guestId missing)',
  )
}

const findOrCreateCart = async (owner: {
  userId?: string | null
  guestId?: string | null
}) => {
  let cart = await findCartByOwner(owner)

  if (!cart) {
    cart = await createCartForOwner(owner)
  }

  if (!cart) {
    // extra guard (practically should never happen now)
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create cart',
    )
  }

  return cart
}
const matchItem = (item: any, productId: string, variantId?: string | null) => {
  const v1 = item.variantId || null
  const v2 = variantId || null
  return item.productId.toString() === productId && v1 === v2
}

const getCartDetailsViewFromDB = async (owner: {
  userId?: string | null
  guestId?: string | null
}) => {
  const match = owner.userId
    ? { ownerType: 'user', userId: new mongoose.Types.ObjectId(owner.userId) }
    : { ownerType: 'guest', guestId: owner.guestId }

  const result = await Cart.aggregate([
    { $match: match },

    // items flatten
    { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },

    // join product
    {
      $lookup: {
        from: 'products',
        localField: 'items.productId',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },

    // shape each item
    {
      $project: {
        ownerType: 1,
        userId: 1,
        guestId: 1,
        createdAt: 1,
        updatedAt: 1,

        item: {
          product: {
            _id: '$product._id',
            name: '$product.productName',
            price: '$product.price',
            images: '$product.images',
          },
          quantity: '$items.quantity',
          variantId: '$items.variantId',
        },
      },
    },

    // regroup items
    {
      $group: {
        _id: '$_id',
        ownerType: { $first: '$ownerType' },
        userId: { $first: '$userId' },
        guestId: { $first: '$guestId' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
        items: { $push: '$item' },
      },
    },
  ])

  // if cart has no items, unwind+group makes items=[{product:null,...}] sometimes
  const cart = result?.[0]
  if (!cart) return null

  cart.items = (cart.items || []).filter((i: any) => i?.product?._id)
  return cart
}

export const getMyCartFromDB = async (owner: {
  userId?: string | null
  guestId?: string | null
}) => {
  await findOrCreateCart(owner)
  const detailed = await getCartDetailsViewFromDB(owner)
  return detailed
}

export const addToCartIntoDB = async (
  owner: { userId?: string | null; guestId?: string | null },
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
  owner: { userId?: string | null; guestId?: string | null },
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
  owner: { userId?: string | null; guestId?: string | null },
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
  guestId?: string | null
}) => {
  const cart = await findOrCreateCart(owner)
  cart.items = [] as any
  await cart.save()
  const detailed = await getCartDetailsViewFromDB(owner)
  return detailed
}
export const mergeGuestCartToUserCartFromDB = async (params: {
  userId: string
  guestId: string
}) => {
  const { userId, guestId } = params

  const guestCart = await Cart.findOne({ ownerType: 'guest', guestId })
  if (!guestCart || guestCart.items.length === 0) {
    return { merged: false }
  }

  const userCart = await findOrCreateCart({ userId, guestId: null })

  for (const gItem of guestCart.items as any[]) {
    const idx = userCart.items.findIndex((u: any) =>
      matchItem(u, gItem.productId.toString(), gItem.variantId || null),
    )
    if (idx >= 0) userCart.items[idx].quantity += gItem.quantity
    else userCart.items.push(gItem as any)
  }

  await userCart.save()
  await Cart.deleteOne({ ownerType: 'guest', guestId })

  const detailed = await getCartDetailsViewFromDB({ userId, guestId: null })
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
