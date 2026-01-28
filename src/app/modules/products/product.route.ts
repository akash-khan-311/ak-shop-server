import express from 'express'
import auth from '../../middlewares/auth'
import multer from 'multer'
import validateRequest from '../../middlewares/validateRequest'
import { ProductValidation } from './product.validation'
import { ProductController } from './product.controller'
const upload = multer({ storage: multer.memoryStorage() })
const router = express.Router()

router.post(
  '/create',
  upload.array('images'),
  auth('admin', 'superAdmin', 'vendor'),
  validateRequest(ProductValidation.createProductSchema),
  ProductController.createProduct
)
router.get('/', ProductController.getAllProducts)
router.get('/:id', ProductController.getSingleProduct)
router.patch(
  '/:id',
  auth('admin', 'superAdmin', 'vendor'),
  upload.array('images', 8),
  ProductController.updateProduct
)

router.delete(
  '/:id',
  auth('admin', 'superAdmin', 'vendor'),
  ProductController.deleteProduct
)

export const ProductRoutes = router
