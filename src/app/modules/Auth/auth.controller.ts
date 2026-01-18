import config from '../../config'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import httpStatus from 'http-status'
import { AuthService } from './auth.service'
import { JwtPayload } from 'jsonwebtoken'

export const loginUser = catchAsync(async (req, res) => {
  const result = await AuthService.loginUserIntoDb(req.body)
  const { refreshToken, accessToken, user } = result
  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production' ? true : false,
    httpOnly: true
  })
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'User logged in successfully',
    data: { accessToken }
  })
})

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies
  // console.log('refresh token from auth controller', refreshToken)
  const result = await AuthService.refreshToken(refreshToken)
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Refresh token Fetched successfully',
    data: result
  })
})

const changePassword = catchAsync(async (req, res) => {
  const { ...passwordData } = req.body
  const result = await AuthService.changePasswordIntoDB(
    req.user as JwtPayload,
    passwordData
  )
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Password changes successfully',
    data: result
  })
})

const forgetPassword = catchAsync(async (req, res) => {
  const { email } = req.body
  const result = await AuthService.forgetPasswordIntoDB(email)
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Password Reset Link Sent Successfully',
    data: null
  })
})

export const AuthController = {
  loginUser,
  refreshToken,
  forgetPassword,
  changePassword
}
