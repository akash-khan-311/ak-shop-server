/* eslint-disable prettier/prettier */
import express from 'express'
import validateRequest from '../../middlewares/validateRequest'
import auth from '../../middlewares/auth'
import multer from 'multer'
import { ReviewValidation } from './review.validation'
import { ReviewController } from './review.controller'
const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.get('/product/:productId', validateRequest(ReviewValidation.getProductReviewsSchema), ReviewController.getProductReviews)

router.post('/', auth('user'), upload.array("images", 5), validateRequest(ReviewValidation.createReviewSchema), ReviewController.createReview)

router.get('/vendor', auth('vendor'), validateRequest(ReviewValidation.getVendorReviewsSchema), ReviewController.getVendorReviews)

router.get('/vendor/summary', auth('vendor'), ReviewController.getVendorReviewSummary)

router.patch(
    "/:reviewId/reply",
    auth("vendor", "admin", "superAdmin"),
    validateRequest(ReviewValidation.replyReviewSchema),
    ReviewController.replyToReview
);

export const ReviewRoutes = router;