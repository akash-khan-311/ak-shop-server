/* eslint-disable prettier/prettier */
import { JwtPayload } from 'jsonwebtoken'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { UserService } from './user.service'
import httpStatus from 'http-status'


export const registerUser = catchAsync(async (req, res) => {
  const result = await UserService.createUserIntoDb(req.body)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'User created successfully',
    data: result
  })

})

export const getUserByEmail = catchAsync(async (req, res) => {
  const result = await UserService.findUserByEmailFromDb(req.params.email)
  if (result) {
    sendResponse(res, {
      status: httpStatus.OK,
      success: true,
      message: 'User found successfully',
      data: result
    })
  }
})
export const getUserById = catchAsync(async (req, res) => {
  const userId = Number(req.params.id)
  if (!Number.isFinite(userId)) {
    return sendResponse(res, { status: httpStatus.BAD_REQUEST, success: false, message: "Invalid user id", data: null })
  }
  const result = await UserService.getUserByIdFromDB(userId)
  sendResponse(res, { status: httpStatus.OK, success: true, message: "User found successfully", data: result })
})
export const getUserByPhoneNumber = catchAsync(async (req, res) => {
  const result = await UserService.getUserWithPhoneNumberFromDb(
    req.params.phone
  )
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'User found successfully',
    data: result
  })
})

export const getUserByProviderId = catchAsync(async (req, res) => {
  const result = await UserService.findUserByProviderIdFromDb(
    req.params.provider,
    req.params.providerId
  )
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'User found successfully',
    data: result
  })
})

// Get All user from database
export const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserService.getAllUsersFromDb()
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    data: result
  })
})

export const getMe = catchAsync(async (req, res) => {

  const user = req.user as JwtPayload
  const result = await UserService.getMeFromDB(user)
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${user?.role} found successfully`,
    data: result
  })
})

export const updateUser = catchAsync(async (req, res) => {
  const userId = Number(req.params.id)
  if (!Number.isFinite(userId)) {
    return sendResponse(res, {
      status: httpStatus.BAD_REQUEST,
      success: false,
      message: "Invalid user id",
      data: null
    })
  }
  const result = await UserService.updateUserIntoDb(userId, req.body)
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'User updated successfully',
    data: result
  })
})

export const addAddress = catchAsync(async (req, res) => {
  const userId = Number(req.params.id)
  if (!Number.isFinite(userId)) {
    return sendResponse(res, {
      status: httpStatus.BAD_REQUEST,
      success: false,
      message: "Invalid user id",
      data: null
    })
  }
  const result = await UserService.addUserAddressIntoDb(userId, req.body)
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Address added successfully',
    data: result
  })
})

export const removeAddress = catchAsync(async (req, res) => {
  const userId = Number(req.params.id)
  const addressId = req.params.addressId
  if (!Number.isFinite(userId)) {
    return sendResponse(res, {
      status: httpStatus.BAD_REQUEST,
      success: false,
      message: "Invalid user id",
      data: null
    })
  }
  const result = await UserService.removeAddressFromDb(userId, addressId)
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Address removed successfully',
    data: result
  })
})

export const setDefaultAddress = catchAsync(async (req, res) => {
  const userId = Number(req.params.id)

  const addressId = req.params.addressId
  const type = req.params.type as 'shipping' | 'billing'
  if (!Number.isFinite(userId)) {
    return sendResponse(res, {
      status: httpStatus.BAD_REQUEST,
      success: false,
      message: "Invalid user id",
      data: null
    })
  }
  const result = await UserService.setDefaultAddressFromDb(userId, addressId, type,)
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Default address set successfully',
    data: result
  })
})

export const updateAvatar = catchAsync(async (req, res) => {
  const userId = Number(req.params.id)
  if (!Number.isFinite(userId)) {
    return sendResponse(res, {
      status: httpStatus.BAD_REQUEST,
      success: false,
      message: "Invalid user id",
      data: null
    })
  }
  const result = await UserService.updateUserAvatarInfoDb(userId, req.file)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Avatar updated successfully',
    data: result
  })
})

export const UserController = {
  registerUser,
  getUserByEmail,
  getUserByPhoneNumber,
  getAllUsers,
  getUserByProviderId,
  updateUser,
  getMe,
  getUserById,
  addAddress,
  updateAvatar,
  removeAddress,
  setDefaultAddress
}
