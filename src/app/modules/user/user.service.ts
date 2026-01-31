/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { IUser, IUserAddress } from './user.interface'
import { JwtPayload } from 'jsonwebtoken'
import { User } from './user.model'
import bcrypt from 'bcryptjs'
import httpStatus from 'http-status'
import { generateUniqueUserId, verifyUserCredentials } from './user.utls'
import config from '../../config'
import { createToken } from '../../utils/commonUtils'
import AppError from '../../errors/AppError'
import mongoose from 'mongoose'
import { cloudinary } from '../../config/cloudinary'
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
    _id: user._id,
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
  const users = await User.find({ isDeleted: false })
  return users
}

export const getUserByIdFromDB = async (id: number) => {
  const user = await User.findOne({ id, isDeleted: false })

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }
  return user
}

export const findUserByEmailFromDb = async (email: string) => {
  const user = await User.findOne({ email, isDeleted: false })
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found using email')
  }

  return user
}

export const findUserByProviderIdFromDb = async (
  provider: string,
  providerId: string
) => {
  const user = await User.findOne({ provider, providerId, isDeleted: false })
  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'User not found using provider id and provider'
    )
  }
  return user
}

export const getUserWithPhoneNumberFromDb = async (phone: string) => {
  const user = await User.findOne({ phone, isDeleted: false })
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
  const uid = Number(userId)

  if (!Number.isFinite(uid)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid user id')
  }

  let result = null
  if (role === 'user') {
    result = await User.findOne({ id: uid })
  }
  if (role === 'admin') {
    result = await User.findOne({ id: uid })
  }
  if (role === 'vendor') {
    result = await User.findOne({ id: uid })
  }
  if (role === 'superAdmin') {
    result = await User.findOne({ id: uid })
  }
  return result
}

const updateUserIntoDb = async (id: number, payload: Partial<IUser>) => {
  const forbidden = ['role', 'status', 'isDeleted', 'password'] as const
  forbidden.forEach((k) => {
    if (k in (payload as any)) delete (payload as any)[k]
  })
  const updatedUser = await User.findOneAndUpdate(
    { id: id },
    { $set: payload },
    { new: true, runValidators: true }
  )
  if (!updatedUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }
  return updatedUser
}

export const addUserAddressIntoDb = async (
  userId: number,
  address: IUserAddress
) => {
  const uid = Number(userId)
  if (!Number.isFinite(uid)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid user id')
  }

  if (!address.fullAddress || !address.type) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Address type and Full Address required'
    )
  }

  // if new address default -> unset old defaults of same type
  if (address.isDefault) {
    await User.updateOne(
      { id: uid, isDeleted: false },
      { $set: { 'addresses.$[elem].isDefault': false } },
      { arrayFilters: [{ 'elem.type': address.type }] }
    )
  }

  // push new address
  const user = await User.findOneAndUpdate(
    { id: uid, isDeleted: false },
    { $push: { addresses: { ...address } } },
    { new: true, runValidators: true }
  )

  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found')

  // if default -> set pointer to last added address id
  if (address.isDefault) {
    const last = user.addresses?.[user.addresses.length - 1] as any
    if (last?._id) {
      if (address.type === 'shipping') {
        ; (user as any).defaultShippingAddressId = last._id
      } else {
        ; (user as any).defaultBillingAddressId = last._id
      }
      await user.save()
    }
  }

  return user
}

export const removeAddressFromDb = async (userId: number, addressId: string) => {
  const uid = Number(userId)
  if (!Number.isFinite(uid)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid user id')
  }

  const user = await User.findOne({ id: uid, isDeleted: false })
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found')

  const target = user.addresses?.find((a: any) => a._id?.toString() === addressId)
  if (!target) throw new AppError(httpStatus.NOT_FOUND, 'Address not found')

  const removedType = target.type
  const wasDefault = !!target.isDefault

  const updated = await User.findOneAndUpdate(
    { id: uid, isDeleted: false },
    { $pull: { addresses: { _id: addressId } } },
    { new: true }
  )
  if (!updated) throw new AppError(httpStatus.NOT_FOUND, 'User not found')

  if (wasDefault) {
    const next = (updated.addresses || []).find((a: any) => a.type === removedType)

    // unset all defaults of that type
    await User.updateOne(
      { id: uid, isDeleted: false },
      { $set: { 'addresses.$[elem].isDefault': false } },
      { arrayFilters: [{ 'elem.type': removedType }] }
    )

    if (next?._id) {
      // set next default true
      await User.updateOne(
        { id: uid, isDeleted: false },
        { $set: { 'addresses.$[elem].isDefault': true } },
        { arrayFilters: [{ 'elem._id': next._id }] }
      )

      if (removedType === 'shipping') (updated as any).defaultShippingAddressId = next._id
      else (updated as any).defaultBillingAddressId = next._id
    } else {
      if (removedType === 'shipping') (updated as any).defaultShippingAddressId = null
      else (updated as any).defaultBillingAddressId = null
    }

    await updated.save()
  }

  return updated
}


export const setDefaultAddressFromDb = async (
  userId: number,
  addressId: string,
  type: 'shipping' | 'billing',
) => {
  const uid = Number(userId)

  // ensure address exists
  const user = await User.findOne({ id: uid, isDeleted: false })
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found')

  const addr = user.addresses?.find((a: any) => a._id?.toString() === addressId)
  if (!addr) throw new AppError(httpStatus.NOT_FOUND, 'Address not found')

  // unset defaults of same type + set this one true
  user.addresses = (user.addresses || []).map((a: any) => {
    if (a.type !== type) return a
    return { ...a.toObject?.() ?? a, isDefault: a._id.toString() === addressId }
  }) as any

  // also set fast pointer id
  if (type === 'shipping') (user as any).defaultShippingAddressId = new mongoose.Types.ObjectId(addressId)
  if (type === 'billing') (user as any).defaultBillingAddressId = new mongoose.Types.ObjectId(addressId)

  await user.save()

  return user
}

export const updateUserAvatarInfoDb = async (
  userId: number,
  file?: Express.Multer.File) => {
  const uid = Number(userId)
  const user = await User.findOne({ id: uid, isDeleted: false })
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }
  let imageData = user.avatar

  if (file) {
    if (user?.avatar?.public_id) {
      await cloudinary.uploader.destroy(user?.avatar?.public_id)
    }

    // ⬆ upload new image
    const uploadResult = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString(
        'base64'
      )}`,
      {
        folder: 'users'
      }
    )

    imageData = {
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id
    }

  }

  const updatedUser = await User.findOneAndUpdate(
    { id: userId },
    { $set: { avatar: imageData } },
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
  getMeFromDB,
  getUserByIdFromDB,
  removeAddressFromDb,
  setDefaultAddressFromDb,
  updateUserAvatarInfoDb,
  addUserAddressIntoDb
}
