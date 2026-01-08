/* eslint-disable prettier/prettier */
import AppError from '../../errors/AppError'
import { IUser } from './user.interface'
import { User } from './user.model'
import httpStatus from 'http-status'
export const createUserIntoDb = async (payload: IUser) => {
  const existingUser = await User.findOne({ email: payload.email })
  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, 'User already exists')
  }
  const user = await User.create(payload)
  return user
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

export const findUserByPhoneNumberFromDB = async (phone: string) => {
  const user = await User.findOne({ phone })
  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'user not found using phone number'
    )
  }
}

const updateUserIntoDb = async (id: string, payload: Partial<IUser>) => {
  const user = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true
  })
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }
  return user
}

export const UserService = {
  updateUserIntoDb,
  createUserIntoDb,
  findUserByPhoneNumberFromDB,
  findUserByEmailFromDb,
  findUserByProviderIdFromDb
}
