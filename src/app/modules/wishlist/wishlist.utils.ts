/* eslint-disable @typescript-eslint/no-explicit-any */
import { Wishlist } from './wishlist.model'
import mongoose from 'mongoose'
import AppError from '../../errors/AppError'
import httpStatus from 'http-status'
export const findWishlistByOwner = async (owner: {
  userId?: string | null
  guestIdForWishlist?: string | null
}) => {
  if (owner.userId) {
    return Wishlist.findOne({
      ownerType: 'user',
      userId: new mongoose.Types.ObjectId(owner.userId),
      isDeleted: false,
    })
  }
  if (owner.guestIdForWishlist) {
    return Wishlist.findOne({
      ownerType: 'guest',
      guestIdForWishlist: owner.guestIdForWishlist,
      isDeleted: false,
    })
  }
  return null
}
export const createWishlistForOwner = async (owner: {
  userId?: string | null
  guestIdForWishlist?: string | null
}) => {
  if (owner.userId) {
    return Wishlist.create({
      ownerType: 'user',
      userId: new mongoose.Types.ObjectId(owner.userId),
      guestIdForWishlist: null,
      items: [],
      isDeleted: false,
    })
  }

  if (owner.guestIdForWishlist) {
    return Wishlist.create({
      ownerType: 'guest',
      userId: null,
      guestIdForWishlist: owner.guestIdForWishlist,
      items: [],
      isDeleted: false,
    })
  }

  throw new AppError(
    httpStatus.BAD_REQUEST,
    'Wishlist owner not found (userId/guestId missing)',
  )
}
export const findOrCreateWishlist = async (owner: {
  userId?: string | null
  guestIdForWishlist?: string | null
}) => {
  let wishlist = await findWishlistByOwner(owner)
  if (!wishlist) wishlist = await createWishlistForOwner(owner)
  if (!wishlist)
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create wishlist',
    )
  return wishlist
}

export const getWishlistDetailsViewFromDB = async (owner: {
  userId?: string | null
  guestIdForWishlist?: string | null
}) => {
  const match = owner.userId
    ? {
        ownerType: 'user',
        userId: new mongoose.Types.ObjectId(owner.userId),
        isDeleted: false,
      }
    : {
        ownerType: 'guest',
        guestIdForWishlist: owner.guestIdForWishlist,
        isDeleted: false,
      }

  const result = await Wishlist.aggregate([
    { $match: match },
    { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: 'products',
        localField: 'items.productId',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },

    {
      $project: {
        ownerType: 1,
        userId: 1,
        guestIdForWishlist: 1,
        createdAt: 1,
        updatedAt: 1,
        item: {
          product: {
            _id: '$product._id',
            name: '$product.productName',
            price: '$product.price',
            images: '$product.images',
            status: '$product.availability',
            slug: '$product.slug',
          },
          variantId: '$items.variantId',
          addedAt: '$items.addedAt',
        },
      },
    },

    {
      $group: {
        _id: '$_id',
        ownerType: { $first: '$ownerType' },
        userId: { $first: '$userId' },
        guestIdForWishlist: { $first: '$guestIdForWishlist' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
        items: { $push: '$item' },
      },
    },
  ])

  const wishlist = result?.[0] || null
  if (!wishlist) return null

  // remove null products (deleted/unavailable product)
  wishlist.items = (wishlist.items || []).filter((i: any) => i?.product?._id)
  return wishlist
}
