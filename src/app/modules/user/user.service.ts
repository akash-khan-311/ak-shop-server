import { IUser } from './user.interface'
import { JwtPayload } from 'jsonwebtoken'
import { User } from './user.model'
import bcrypt from 'bcryptjs'
import httpStatus from 'http-status'
import { generateUniqueUserId, verifyUserCredentials } from './user.utls'
import config from '../../config'
import { createToken } from '../../utils/commonUtils'
import AppError from '../../errors/AppError'
export const createUserIntoDb = async (payload: IUser) => {
  const existingUser = await User.findOne({ email: payload.email })
  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, 'User already exists')
  }
  if (!payload.password) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password is required')
  }
  if (!payload.email) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Email is required')
  }
  const userId = await generateUniqueUserId()
  const hashedPassword = await bcrypt.hash(payload.password, 10)
  await User.create({ ...payload, id: userId, password: hashedPassword })
  const user = await verifyUserCredentials(payload.email, payload.password)
  // Generate Token
  const jwtPayload = {
    name: user.name,
    email: user.email,
    userId: user.id,
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
  return { accessToken, refreshToken, user }
}

export const getAllUsersFromDb = async () => {
  const users = await User.find()
  return users
}

export const findUserByEmailFromDb = async (email: string) => {
  const user = await User.findOne({ email })
  if (!user) {
    throw new AppError(httpStatus.NOT_EXTENDED, 'User not found using email')
  }

  return user
}

export const findUserByProviderIdFromDb = async (
  provider: string,
  providerId: string
) => {
  const user = await User.findById({ provider, providerId })
  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'User not found using provider id and provider'
    )
  }
  return user
}

export const getUserWithPhoneNumberFromDb = async (phone: string) => {
  const user = await User.findOne({ phone })
  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'user not found using phone number'
    )
  }
  return user
}

const getMeFromDB = async (payload: JwtPayload) => {
  const { userId, role } = payload
  let result = null
  if (role === 'user') {
    result = await User.findOne({ _id: userId }).populate('address')
  }
  if (role === 'admin') {
    result = await User.findOne({ _id: userId }).populate('address')
  }
  if (role === 'vendor') {
    result = await User.findOne({ _id: userId }).populate('address')
  }
  if (role === 'superAdmin') {
    result = await User.findOne({ _id: userId }).populate('address')
  }
  return result
}

const updateUserIntoDb = async (id: string, payload: Partial<IUser>) => {
  const updatedUser = await User.findByIdAndUpdate(
    { _id: id },
    { $set: payload },
    { new: true, runValidators: true }
  )
  if (!updatedUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }
  return updatedUser
}

export const UserService = {
  updateUserIntoDb,
  createUserIntoDb,
  getUserWithPhoneNumberFromDb,
  findUserByEmailFromDb,
  findUserByProviderIdFromDb,
  getAllUsersFromDb,
  getMeFromDB
}
