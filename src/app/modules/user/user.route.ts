/* eslint-disable prettier/prettier */
import express from 'express'
import validateRequest from '../../middlewares/validateRequest'
import { UserValidation } from './user.validation'
import { UserController } from './user.controller'
import auth from '../../middlewares/auth'
import multer from 'multer'
const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })
router.post(
  '/register',
  validateRequest(UserValidation.registerSchema),
  UserController.registerUser
)
router.post('/:id/addresses', auth('user'), validateRequest(UserValidation.addAddressSchema), UserController.addAddress)
router.delete(
  '/:id/addresses/:addressId',
  auth('user', 'admin', 'vendor', 'superAdmin'),
  validateRequest(UserValidation.removeAddressSchema),
  UserController.removeAddress
)
router.patch(
  '/:id/addresses/:addressId/default/:type',
  auth('user', 'admin', 'vendor', 'superAdmin'),
  validateRequest(UserValidation.setDefaultAddressSchema),
  UserController.setDefaultAddress
)
router.patch(
  '/:id/avatar',
  auth('user', 'admin', 'vendor', 'superAdmin'),
  validateRequest(UserValidation.updateAvatarSchema),
  upload.single('avatar'),
  UserController.updateAvatar
)
router.get('/email/:email', UserController.getUserByEmail)

router.get('/phone/:phone', UserController.getUserByPhoneNumber)

router.get(
  '/me',
  auth('admin', 'user', 'vendor', 'superAdmin'),
  UserController.getMe
)
router.get('/', UserController.getAllUsers)
router.get('/:id', UserController.getUserById)
router.patch(
  '/:id',
  auth('user'),
  validateRequest(UserValidation.updateProfileSchema),
  UserController.updateUser
)

export const UserRoutes = router
