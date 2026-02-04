import express from 'express'
import validateRequest from '../../middlewares/validateRequest'
import { AuthValidation } from './auth.validation'
import { AuthController, oauthSuccessHandler } from './auth.controller'
import auth from '../../middlewares/auth'
import passport from 'passport'
import { USER_ROLE } from '../../constants/userRole_constant'
import config from '../../config'
const router = express.Router()

router.post(
  '/login',
  validateRequest(AuthValidation.loginSchema),
  AuthController.loginUser,
)
router.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshTokenValidationSchema),
  AuthController.refreshToken,
)
router.post(
  '/forget-password',
  validateRequest(AuthValidation.forgetPasswordValidationSchema),
  AuthController.forgetPassword,
)
router.post('/logout', AuthController.logout)

router.post(
  '/change-password',
  auth(
    USER_ROLE.admin,
    USER_ROLE.superAdmin,
    USER_ROLE.user,
    USER_ROLE.developer,
    USER_ROLE.editor,
  ),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthController.changePassword,
)

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  }),
)
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${config.client_side_url}/login?error=google`,
  }),
  oauthSuccessHandler,
)

router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'], session: false }),
)
router.get(
  '/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: `${config.client_side_url}/login?error=github`,
  }),
  oauthSuccessHandler,
)

router.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['email'], session: false }),
)
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    session: false,
    failureRedirect: `${config.client_side_url}/login?error=facebook`,
  }),
  oauthSuccessHandler,
)

export const AuthRoutes = router
