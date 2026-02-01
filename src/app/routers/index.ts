import express from 'express'
import { UserRoutes } from '../modules/user/user.route'
import { AuthRoutes } from '../modules/Auth/auth.route'
import { CategoryRoutes } from '../modules/category/category.route'
import { ProductRoutes } from '../modules/products/product.route'
import { SpecTemplateRoutes } from '../modules/specTemplate/specTemplate.route'
import { ReviewRoutes } from '../modules/reviews/review.route'
import { CouponRoutes } from '../modules/coupons/coupon.route'

/**
 * Main router configuration
 * This file serves as the central point for registering all module routes
 */
const router = express.Router()

/**
 * Array of module routes to be registered
 * Each object contains:
 * - path: The base path for the module (e.g., '/auth')
 * - route: The router instance for the module
 */
const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes
  },
  { path: '/auth', route: AuthRoutes },
  { path: '/category', route: CategoryRoutes },
  { path: '/spec-template', route: SpecTemplateRoutes },
  { path: '/product', route: ProductRoutes },
  { path: '/reviews', route: ReviewRoutes },
  { path: '/coupons', route: CouponRoutes }
]

/**
 * Register all module routes
 * This loop iterates through the moduleRoutes array and registers each route
 * with its corresponding path
 */
moduleRoutes.forEach(route => {
  if (route.route) {
    router.use(route.path, route.route)
  }
})

export default router
