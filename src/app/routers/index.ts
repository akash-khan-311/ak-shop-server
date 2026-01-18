import express from 'express'
import { UserRoutes } from '../modules/user/user.route'
import { AuthRoutes } from '../modules/Auth/auth.route'
import { CategoryRoutes } from '../modules/category/category.route'

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
  { path: '/category', route: CategoryRoutes }
]

/**
 * Register all module routes
 * This loop iterates through the moduleRoutes array and registers each route
 * with its corresponding path
 */
moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router
