/* eslint-disable prettier/prettier */
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
  const result = await UserService.findUserByPhoneNumberFromDB(req.params.phone)
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

export const UserController = {
  registerUser,
  getUserByEmail,
  getUserByPhoneNumber,
  getUserByProviderId
}
