import config from '../../config'
import AppError from '../../errors/AppError'
import { createToken } from '../../utils/commonUtils'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { verifyUserCredentials } from '../user/user.utls'
import { TLoginUser } from './auth.interface'
import bcrypt from 'bcryptjs'
import httpStatus from 'http-status'
import { User } from '../user/user.model'
import sendEmail from '../../utils/sendEmail'
export const loginUserIntoDb = async (payload: TLoginUser) => {
  let user

  if (payload.email) {
    user = await verifyUserCredentials(payload.email, payload.password)
  } else if (payload.phone) {
    user = await verifyUserCredentials(
      undefined,
      payload.password,
      payload.phone
    )
  }

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }

  const jwtPayload = {
    name: user.name,
    email: user.email,
    userId: user._id,
    role: user.role,
    createdAt: user.createdAt
  }

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_token_secret as string,
    config.jwt_access_token_expires_in as string
  )

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_token_secret as string,
    config.jwt_refresh_token_expires_in as string
  )

  return {
    accessToken,
    refreshToken,
    user
  }
}

const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized')
  }
  // verify token
  const decoded = jwt.verify(
    token,
    config.jwt_refresh_token_secret as string
  ) as JwtPayload

  const { userId } = decoded

  const user = await verifyUserCredentials(
    undefined,
    undefined,
    undefined,
    userId
  )
  const jwtPayload = {
    name: user.name,
    email: user.email,
    userId: user._id,
    role: user.role,
    createdAt: user.createdAt
  }

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_token_secret as string,
    config.jwt_access_token_expires_in as string
  )

  return {
    accessToken
  }
}

export const changePasswordIntoDB = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string }
) => {
  await verifyUserCredentials(userData.userId, payload.oldPassword)

  const hashedPassword = await bcrypt.hash(payload.newPassword, 10)
  await User.findOneAndUpdate(
    { _id: userData.userId, role: userData.role },
    { password: hashedPassword, passwordChangeAt: Date.now }
  )

  return null
}

const forgetPasswordIntoDB = async (email: string) => {
  const user = await verifyUserCredentials(email)
  const jwtPayload = {
    userId: user._id,
    role: user.role
  }
  const resetToken = createToken(
    jwtPayload,
    config.jwt_refresh_token_secret as string,
    '5m'
  )

  const resetLink = `${config.client_side_url}/reset-password?token=${resetToken}&id=${user._id}`

  const emailTemplate = {
    subject: 'Reset Your Password',
    text: `Reset your password using this link: ${resetLink}`,
    emailBody: `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password.</p>
      <p>This link will expire in <strong>5 minutes</strong>.</p>
      <a href="${resetLink}" target="_blank">Reset Password</a>
      <p>If you didn’t request this, please ignore this email.</p>
    `
  }

  await sendEmail(user.email, emailTemplate)
}

export const AuthService = {
  loginUserIntoDb,
  refreshToken,
  changePasswordIntoDB,
  forgetPasswordIntoDB
}
