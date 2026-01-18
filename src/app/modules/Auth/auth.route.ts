import express from 'express'
import validateRequest from '../../middlewares/validateRequest'
import { AuthValidation } from './auth.validation'
import { AuthController } from './auth.controller'
import auth from '../../middlewares/auth'
import { USER_ROLE, UserRole } from '../../constants/userRole_constant'
const router = express.Router()

router.post(
  '/login',
  validateRequest(AuthValidation.loginSchema),
  AuthController.loginUser
)
router.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshTokenValidationSchema),
  AuthController.refreshToken
)
router.post(
  '/forget-password',
  validateRequest(AuthValidation.forgetPasswordValidationSchema),
  AuthController.forgetPassword
)

router.post(
  '/change-password',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.user, USER_ROLE.vendor),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthController.changePassword
)

export const AuthRoutes = router
