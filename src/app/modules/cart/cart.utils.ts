import crypto from 'crypto'

export const generateGuestId = () => crypto.randomUUID()

export const guestCookieOptions = (isProd: boolean) => ({
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const
  // maxAge: 1000 * 60 * 60 * 24 * 30, // optional: 30 days
})
