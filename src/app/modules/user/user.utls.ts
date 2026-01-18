/* eslint-disable prettier/prettier */
import bcrypt from 'bcryptjs'
import AppError from '../../errors/AppError'
import httpStatus from 'http-status'
import { User } from './user.model'

export const hashedPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)
  return hashedPassword
}

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash)
}

// Verify user Credentials
export const verifyUserCredentials = async (
  email?: string,
  password?: string,
  phone?: string,
  userId?: string
) => {
  let user

  if (email) {
    user = await User.findOne({ email }).select('+password')
  } else if (phone) {
    user = await User.findOne({ phone }).select('+password')
  } else if (userId) {
    user = await User.findOne({ _id: userId }).select('+password')
  }

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User Not Found')
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User deleted')
  }

  if (user.status === 'blocked') {
    throw new AppError(httpStatus.BAD_REQUEST, 'User blocked')
  }

  if (password) {
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new AppError(httpStatus.FORBIDDEN, 'Incorrect Password')
    }
  }

  return user
}
