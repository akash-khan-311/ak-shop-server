/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import mongoose from 'mongoose'
import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { Cart } from '../cart/cart.model'
import { TCheckoutSummary } from './checkout.interface'
import { Product } from '../products/product.model'
import { Coupon } from '../coupons/coupon.model'
type ShippingArea = 'dhaka' | 'outside_dhaka'

// ---------------- Owner Cart ----------------
const getCartByOwner = async (owner: {
  userId?: string | null
  guestIdForCartItem?: string | null
}) => {
  if (owner.userId) {
    return Cart.findOne({
      ownerType: 'user',
      userId: new mongoose.Types.ObjectId(owner.userId),
    })
  }
  if (owner.guestIdForCartItem) {
    return Cart.findOne({
      ownerType: 'guest',
      guestIdForCartItem: owner.guestIdForCartItem,
    })
  }
  return null
}

// ---------------- Shipping & Tax ----------------
const computeShipping = (area: ShippingArea): number => {
  return area === 'dhaka' ? 60 : 100
}

const computeTax = (
  items: { unitPrice: number; quantity: number }[],
): number => {
  let tax = 0
  for (const item of items) {
    const lineTotal = item.unitPrice * item.quantity
    tax += lineTotal * 0.03
  }
  return Math.round(tax)
}

// ---------------- Coupon Utils ----------------
const normalizeCode = (code: string) => code.trim().toUpperCase()

const isDateBeforeNow = (d?: Date | null) =>
  !!d && new Date(d).getTime() < Date.now()
const isDateAfterNow = (d?: Date | null) =>
  !!d && new Date(d).getTime() > Date.now()

// eligible subtotal (scope অনুযায়ী)
const getEligibleSubtotal = (coupon: any, lineItems: any[]) => {
  const scope = coupon.scope as 'global' | 'products' | 'categories'

  if (scope === 'global') {
    return lineItems.reduce((sum, i) => sum + i.lineTotal, 0)
  }

  if (scope === 'products') {
    const couponProductIds = (coupon.productIds || []).map((id: any) =>
      id.toString(),
    )
    const matched = lineItems.filter(i =>
      couponProductIds.includes(i.productId),
    )
    return matched.reduce((sum, i) => sum + i.lineTotal, 0)
  }

  // categories
  const couponCategoryIds = (coupon.categoryIds || []).map((id: any) =>
    id.toString(),
  )
  const matched = lineItems.filter(
    i => i.categoryId && couponCategoryIds.includes(i.categoryId),
  )
  return matched.reduce((sum, i) => sum + i.lineTotal, 0)
}

// discount calculation (type)
const computeDiscount = (coupon: any, eligibleSubtotal: number) => {
  if (eligibleSubtotal <= 0) return 0

  const type = coupon.type as 'percentage' | 'fixed'
  const value = Number(coupon.value || 0)
  if (value <= 0) return 0

  let discount = 0

  if (type === 'percentage') {
    discount = Math.round(eligibleSubtotal * (value / 100))
  } else {
    discount = Math.round(value)
  }

  // never exceed eligible subtotal
  return Math.min(discount, Math.round(eligibleSubtotal))
}

const enforceUsageLimits = (coupon: any, userId?: string | null) => {
  // usageLimit
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Coupon usage limit reached')
  }

  // perUserLimit (requires login)
  if (coupon.perUserLimit != null) {
    if (!userId) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'Login required to use coupon',
      )
    }

    const uid = userId.toString()
    const usedByMe = (coupon.usedBy || []).filter(
      (u: any) => u.userId?.toString() === uid,
    ).length

    if (usedByMe >= coupon.perUserLimit) {
      throw new AppError(httpStatus.BAD_REQUEST, 'You already used this coupon')
    }
  }
}

// verify + discount
const getDiscountByCoupon = async (params: {
  couponCode?: string
  userId?: string | null
  lineItems: any[]
}) => {
  const { couponCode, userId, lineItems } = params
  if (!couponCode) return { discount: 0, coupon: null }

  const code = normalizeCode(couponCode)

  const coupon = await Coupon.findOne({
    code,
    isDeleted: false,
    isActive: true,
  })
  if (!coupon) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid coupon')
  }

  // date window check
  if (coupon.startDate && isDateAfterNow(coupon.startDate)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Coupon not started yet')
  }
  if (coupon.endDate && isDateBeforeNow(coupon.endDate)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Coupon expired')
  }

  // usage limits
  enforceUsageLimits(coupon, userId)

  // scope match check
  const eligibleSubtotal = getEligibleSubtotal(coupon, lineItems)
  if (eligibleSubtotal <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid coupon for these items')
  }

  const discount = computeDiscount(coupon, eligibleSubtotal)
  return { discount, coupon }
}

// ---------------- Main Summary ----------------
export const getCheckoutSummaryFromDB = async (
  owner: { userId?: string | null; guestId?: string | null },
  options?: { couponCode?: string; shippingArea?: ShippingArea },
): Promise<TCheckoutSummary> => {
  const cart = await getCartByOwner(owner)

  if (!cart || !cart.items || cart.items.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Cart is empty')
  }

  const productIds = cart.items.map((i: any) => i.productId)

  //  categoryId  coupon scope=categories
  const products = await Product.find({
    _id: { $in: productIds },
    isDeleted: false,
    isPublished: true,
  }).select(
    '_id productName regularPrice price images categorySlug subcategorySlug',
  )

  const productMap = new Map(products.map((p: any) => [p._id.toString(), p]))

  let subtotal = 0

  //  line items with categoryId included (for coupon matching)
  const lineItems = cart.items.map((ci: any) => {
    const p = productMap.get(ci.productId.toString())
    if (!p)
      throw new AppError(httpStatus.NOT_FOUND, 'Some products are unavailable')

    const unitPrice = Number(p.discountedPrice ?? p.price ?? 0)
    const quantity = Number(ci.quantity ?? 0)

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid product price')
    }
    if (!Number.isFinite(quantity) || quantity < 1) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid quantity in cart')
    }

    const lineTotal = unitPrice * quantity
    subtotal += lineTotal

    return {
      productId: p._id.toString(),
      categoryId: p.categoryId?.toString?.() || null,
      name: p.name,
      image: p.images?.[0]?.url || null,
      variantId: ci.variantId ?? null,
      unitPrice,
      quantity,
      lineTotal,
    }
  })

  const shippingArea: ShippingArea = options?.shippingArea || 'dhaka'
  const shippingCharge = computeShipping(shippingArea)

  const tax = computeTax(
    lineItems.map(i => ({ unitPrice: i.unitPrice, quantity: i.quantity })),
  )

  const { discount } = await getDiscountByCoupon({
    couponCode: options?.couponCode,
    userId: owner.userId || null,
    lineItems,
  })

  const total = Math.max(
    0,
    Math.round(subtotal) + shippingCharge + tax - Math.round(discount),
  )

  return {
    items: lineItems.map(({ categoryId, ...rest }) => rest), //
    subtotal: Math.round(subtotal),
    shippingCharge: Math.round(shippingCharge),
    tax: Math.round(tax),
    discount: Math.round(discount),
    total,
  }
}

export const CheckoutService = {
  getCheckoutSummaryFromDB,
}
