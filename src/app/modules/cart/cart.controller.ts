/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status'

import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { CartService } from './cart.service'
import { generateGuestId, guestCookieOptions, isProd } from '../../helpers'

const resolveOwner = (req: any, res: any) => {
  const userId = (req.user as any)?._id?.toString() || null
  let guestIdForCartItem = req.cookies?.guestIdForCartItem || null

  // if no login + no guest cookie -> create
  if (!userId && !guestIdForCartItem) {
    guestIdForCartItem = generateGuestId()
    res.cookie(
      'guestIdForCartItem',
      guestIdForCartItem,
      guestCookieOptions(isProd),
    )
  }

  return { userId, guestIdForCartItem }
}

export const getMyCart = catchAsync(async (req, res) => {
  const owner = resolveOwner(req, res)

  const result = await CartService.getMyCartFromDB(owner)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Cart fetched successfully',
    data: result,
  })
})

export const addToCart = catchAsync(async (req, res) => {
  const owner = resolveOwner(req, res)

  const result = await CartService.addToCartIntoDB(owner, req.body)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Added to cart successfully',
    data: result,
  })
})

export const updateCartItem = catchAsync(async (req, res) => {
  const owner = resolveOwner(req, res)

  const result = await CartService.updateCartItemIntoDB(owner, req.body)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Cart item updated successfully',
    data: result,
  })
})

export const removeCartItem = catchAsync(async (req, res) => {
  const owner = resolveOwner(req, res)

  const result = await CartService.removeCartItemFromDB(owner, req.body)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Cart item removed successfully',
    data: result,
  })
})

export const clearCart = catchAsync(async (req, res) => {
  const owner = resolveOwner(req, res)

  const result = await CartService.clearCartFromDB(owner)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Cart cleared successfully',
    data: result,
  })
})
export const mergeGuestCartToUserCart = catchAsync(
  async (req: any, res: any) => {
    const userId = (req.user as any)?._id?.toString()
    if (!userId) {
      return sendResponse(res, {
        status: httpStatus.UNAUTHORIZED,
        success: false,
        message: 'Unauthorized',
        data: null,
      })
    }

    const guestIdForCartItem =
      req.cookies?.guestIdForCartItem || req.body.guestIdForCartItem
    if (!guestIdForCartItem) {
      return sendResponse(res, {
        status: httpStatus.BAD_REQUEST,
        success: false,
        message: 'guestIdForCartItem not found',
        data: null,
      })
    }

    const result = await CartService.mergeGuestCartToUserCartFromDB({
      userId,
      guestIdForCartItem,
    })

    // merge done -> clear cookie
    if (result.merged) {
      res.clearCookie('guestIdForCartItem', guestCookieOptions(isProd))
    }

    sendResponse(res, {
      status: httpStatus.OK,
      success: true,
      message: result.merged
        ? 'Guest cart merged successfully'
        : 'Nothing to merge',
      data: result,
    })
  },
)
export const CartController = {
  getMyCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeGuestCartToUserCart,
}
