/* eslint-disable @typescript-eslint/no-explicit-any */

import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { CheckoutService } from './checkout.service'
import { generateGuestId, guestCookieOptions } from '../../helpers'

const isProd = process.env.NODE_ENV === 'production'

const resolveOwner = (req: any, res: any) => {
  const userId = (req.user as any)?._id?.toString() || null
  let guestIdForCartItem = req.cookies?.guestIdForCartItem || null

  // no login + no guest cookie -> create guestId
  if (!userId && !guestIdForCartItem) {
    guestIdForCartItem = generateGuestId()
    res.cookie('guestId', guestIdForCartItem, guestCookieOptions(isProd))
  }

  return { userId, guestIdForCartItem }
}

export const getCheckoutSummary = catchAsync(async (req, res) => {
  const owner = resolveOwner(req, res)

  const shippingArea =
    (req.query?.shippingArea as 'dhaka' | 'outside_dhaka' | undefined) ||
    'dhaka'

  const couponCode = (req.query?.couponCode as string | undefined) || undefined

  const result = await CheckoutService.getCheckoutSummaryFromDB(owner, {
    shippingArea,
    couponCode,
  })

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Checkout summary fetched successfully',
    data: result,
  })
})

export const CheckoutController = {
  getCheckoutSummary,
}
