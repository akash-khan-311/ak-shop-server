import express from 'express'
import optionalAuth from '../../middlewares/optionalAuth'
import { WishlistController } from './wishlist.controller'
import validateRequest from '../../middlewares/validateRequest'
import { WishlistValidation } from './wishlist.validation'
import auth from '../../middlewares/auth'
const router = express.Router()

router.get('/', optionalAuth(), WishlistController.getMyWishlist)
router.post(
  '/add',
  optionalAuth(),
  validateRequest(WishlistValidation.addToWishListValidationSchema),
  WishlistController.addToWishlist,
)

router.delete(
  '/remove-item',
  optionalAuth(),
  validateRequest(WishlistValidation.removeWishListItemValidationSchema),
  WishlistController.removeWishlistItem,
)

router.delete('/clear', optionalAuth(), WishlistController.clearWishlist)
router.post(
  '/merge',
  auth('user', 'admin', 'superAdmin'),
  WishlistController.mergeGuestWishlistToUserWishlist,
)

export const WishlistRoutes = router
