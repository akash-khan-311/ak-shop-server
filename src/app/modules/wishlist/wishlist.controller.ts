import { generateGuestId, guestCookieOptions, isProd } from '../../helpers'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { WishlistService } from './wishlist.service'
import httpStatus from 'http-status'
/* eslint-disable @typescript-eslint/no-explicit-any */
const resolveOwner = (req: any, res: any) => {
  const userId = (req.user as any)?._id?.toString() || null
  let guestIdForWishlist = req.cookies?.guestIdForWishlist || null

  if (!userId && !guestIdForWishlist) {
    guestIdForWishlist = generateGuestId()
    res.cookie(
      'guestIdForWishlist',
      guestIdForWishlist,
      guestCookieOptions(isProd),
    )
  }

  return { userId, guestIdForWishlist }
}

export const getMyWishlist = catchAsync(async (req, res) => {
  const owner = resolveOwner(req, res)
  const result = await WishlistService.getMyWishlistFromDB(owner)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Wishlist fetched successfully',
    data: result,
  })
})

export const addToWishlist = catchAsync(async (req, res) => {
  const owner = resolveOwner(req, res)
  const result = await WishlistService.addToWishlistIntoDB(owner, req.body)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Added to wishlist successfully',
    data: result,
  })
})

export const removeWishlistItem = catchAsync(async (req, res) => {
  const owner = resolveOwner(req, res)
  const result = await WishlistService.removeWishlistItemFromDB(owner, req.body)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Wishlist item removed successfully',
    data: result,
  })
})
export const clearWishlist = catchAsync(async (req, res) => {
  const owner = resolveOwner(req, res)
  const result = await WishlistService.clearWishlistFromDB(owner)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Wishlist cleared successfully',
    data: result,
  })
})

export const mergeGuestWishlistToUserWishlist = catchAsync(
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

    const guestIdForWishlist =
      req.cookies?.guestIdForWishlist || req.body.guestIdForWishlist
    if (!guestIdForWishlist) {
      return sendResponse(res, {
        status: httpStatus.BAD_REQUEST,
        success: false,
        message: 'guestId not found',
        data: null,
      })
    }

    const result = await WishlistService.mergeGuestWishlistToUserWishlistFromDB(
      { userId, guestIdForWishlist },
    )

    if (result.merged) {
      sendResponse(res, {
        status: httpStatus.OK,
        success: true,
        message: result.merged
          ? 'Guest wishlist merged successfully'
          : 'Nothing to merge',
        data: result,
      })
    }
  },
)
export const WishlistController = {
  getMyWishlist,
  addToWishlist,
  removeWishlistItem,
  clearWishlist,
  mergeGuestWishlistToUserWishlist,
}
