/* eslint-disable prettier/prettier */
import express from 'express'
import validateRequest from '../../middlewares/validateRequest'
import { UserValidation } from './user.validation'
import { UserController } from './user.controller'
const router = express.Router()

router.post(
  '/register',
  validateRequest(UserValidation.registerSchema),
  UserController.registerUser
)
export const UserRoutes = router
