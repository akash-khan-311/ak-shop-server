import express from 'express'
import optionalAuth from '../../middlewares/optionalAuth'
import validateRequest from '../../middlewares/validateRequest'
import { CheckoutValidation } from './checkout.validation'
import { CheckoutController } from './checkout.controller'

const router = express.Router()

router.get(
  '/summary',
  optionalAuth(), //
  validateRequest(CheckoutValidation.checkoutSummaryValidationSchema),
  CheckoutController.getCheckoutSummary,
)

export const CheckoutRoutes = router
