/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload } from 'jsonwebtoken'
import config from '../config'
import { TUserRole } from '../interfaces/userRole_type'
import catchAsync from '../utils/catchAsync'
import { verifyToken } from '../utils/commonUtils'

const optionalAuth = (...roles: TUserRole[]) => {
  return catchAsync(async (req, _res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return next()
    }

    try {
      const decoded = verifyToken(
        authHeader,
        config.jwt_access_token_secret as string,
      ) as JwtPayload

      const role = (decoded as any)?.role

      if (roles.length > 0 && role && !roles.includes(role)) {
        return next()
      }

      req.user = decoded
      return next()
    } catch {
      return next()
    }
  })
}

export default optionalAuth
