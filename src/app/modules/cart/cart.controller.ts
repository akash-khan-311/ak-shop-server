/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status'
import { generateGuestId, guestCookieOptions } from './cart.utils'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { CartService } from './cart.service'
const isProd = process.env.NODE_ENV === 'production'

const resolveOwner = (req: any, res: any) => {
  const userId = (req.user as any)?._id?.toString() || null
  let guestId = req.cookies?.guestId || null

  // if no login + no guest cookie -> create
  if (!userId && !guestId) {
    guestId = generateGuestId()
    res.cookie('guestId', guestId, guestCookieOptions(isProd))
  }

  return { userId, guestId }
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

    const guestId = req.cookies?.guestId || req.body.guestId
    if (!guestId) {
      return sendResponse(res, {
        status: httpStatus.BAD_REQUEST,
        success: false,
        message: 'guestId not found',
        data: null,
      })
    }

    const result = await CartService.mergeGuestCartToUserCartFromDB({
      userId,
      guestId,
    })

    // merge done -> clear cookie
    if (result.merged) {
      res.clearCookie('guestId', guestCookieOptions(isProd))
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
