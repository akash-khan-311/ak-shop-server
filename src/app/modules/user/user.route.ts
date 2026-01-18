/* eslint-disable prettier/prettier */
import express from 'express'
import validateRequest from '../../middlewares/validateRequest'
import { UserValidation } from './user.validation'
import { UserController } from './user.controller'
import auth from '../../middlewares/auth'
const router = express.Router()

router.post(
  '/register',
  validateRequest(UserValidation.registerSchema),
  UserController.registerUser
)
router.get('/email/:email', UserController.getUserByEmail)
router.get('/phone/:phone', UserController.getUserByPhoneNumber)
router.get('/', UserController.getAllUsers)
router.patch(
  '/:id',
  auth('user'),
  validateRequest(UserValidation.updateProfileSchema),
  UserController.updateUser
)

router.get(
  '/me',
  auth('admin', 'user', 'vendor', 'superAdmin'),
  UserController.getMe
)

export const UserRoutes = router
