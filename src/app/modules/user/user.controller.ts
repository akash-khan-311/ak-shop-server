import { JwtPayload } from 'jsonwebtoken'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { UserService } from './user.service'
import httpStatus from 'http-status'

export const registerUser = catchAsync(async (req, res) => {
  const result = await UserService.createUserIntoDb(req.body)
  if (req.body) {
    sendResponse(res, {
      status: httpStatus.OK,
      success: true,
      message: 'User created successfully',
      data: result
    })
  }
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

const getMe = catchAsync(async (req, res) => {
  const result = await UserService.getMeFromDB(req.user as JwtPayload)
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${req?.user?.role} found successfully`,
    data: result
  })
})

export const updateUser = catchAsync(async (req, res) => {
  const id = req.params.id
  const result = await UserService.updateUserIntoDb(id, req.body)
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'User updated successfully',
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
  getMe
}
