/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from 'crypto'
export const isProd = process.env.NODE_ENV === 'production'
export const guestCookieOptions = (isProd: boolean) => ({
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  path: '/',
})
export const matchItem = (
  item: any,
  productId: string,
  variantId?: string | null,
) => {
  const v1 = item.variantId || null
  const v2 = variantId || null
  return item.productId.toString() === productId && v1 === v2
}

export const generateGuestId = () => crypto.randomBytes(16).toString('hex')
