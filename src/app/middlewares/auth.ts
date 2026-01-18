import { JwtPayload } from 'jsonwebtoken'
import config from '../config'
import AppError from '../errors/AppError'
import { TUserRole } from '../interfaces/userRole_type'
import catchAsync from '../utils/catchAsync'
import { verifyToken } from '../utils/commonUtils'

// initiate authentication route auth function
const auth = (...rolesAndFlags: Array<TUserRole | boolean>) => {
  // Check if the last argument is a boolean flag
  let isIgnoreAuthentication = false
  if (typeof rolesAndFlags[rolesAndFlags.length - 1] === 'boolean') {
    isIgnoreAuthentication = rolesAndFlags.pop() as boolean
  }

  // The remaining arguments are the required roles
  const requiredRoles = rolesAndFlags as TUserRole[]
  return catchAsync(async (req, res, next) => {
    // Skip authentication if flag is set
    if (isIgnoreAuthentication) {
      return next()
    }
    // Extract token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader) {
      throw new AppError(
        401,
        'UNAUTHORIZED',
        'You are not authorized. No token provided.'
      )
    }
    const token = authHeader

    // Verify token
    const decoded = verifyToken(token, config.jwt_access_token_secret as string)
    const { user_id, role, iat } = decoded

    // Check if user has required role
    if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
      throw new AppError(
        403,
        'FORBIDDEN',
        'You do not have permission to perform this action.'
      )
    }
    // Attach user to request object
    req.user = decoded as JwtPayload
    next()
  })
}
export default auth
