import express from 'express'
import validateRequest from '../../middlewares/validateRequest'
import auth from '../../middlewares/auth'
import { CartController } from './cart.controller'
import { cartValidation } from './cart.validation'
import optionalAuth from '../../middlewares/optionalAuth'

const router = express.Router()
router.get('/', optionalAuth(), CartController.getMyCart)

router.post(
  '/add',
  optionalAuth(),
  validateRequest(cartValidation.addToCartValidationSchema),
  CartController.addToCart,
)

router.patch(
  '/update-item',
  optionalAuth(),
  validateRequest(cartValidation.updateCartItemValidationSchema),
  CartController.updateCartItem,
)

router.delete(
  '/remove-item',
  optionalAuth(),
  validateRequest(cartValidation.removeCartItemValidationSchema),
  CartController.removeCartItem,
)
router.delete('/clear', optionalAuth(), CartController.clearCart)
// only logged user (merge after login)
router.post(
  '/merge',
  auth('user', 'admin', 'superAdmin'),
  validateRequest(cartValidation.mergeGuestCartValidationSchema),
  CartController.mergeGuestCartToUserCart,
)
export const CartRoutes = router
