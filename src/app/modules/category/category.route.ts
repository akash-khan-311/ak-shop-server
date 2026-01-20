import express from 'express'
import validateRequest from '../../middlewares/validateRequest'
import { CategoryValidation } from './category.validation'
import { CategoryController } from './category.controller'
import auth from '../../middlewares/auth'
import multer from 'multer'
import { uploadCategoryImage } from '../../middlewares/multer'
const storage = multer.memoryStorage()
const router = express.Router()
const upload = multer({ storage })
router.post(
  '/create',
  upload.single('image'),
  auth('admin', 'superAdmin', 'vendor'),
  validateRequest(CategoryValidation.createCategoryValidationSchema),
  CategoryController.createCategory
)

router.post(
  '/:id/create-subcategory',
  auth('admin', 'superAdmin', 'vendor'),
  validateRequest(CategoryValidation.subCategoryValidationSchema),
  CategoryController.createSubCategory
)

router.get(
  '/',
  auth('admin', 'superAdmin', 'vendor'),
  CategoryController.getAllCategories
)
router.get(
  '/:id',
  auth('admin', 'superAdmin', 'vendor'),
  CategoryController.getSingleCategory
)
router.patch(
  '/:id',
  auth('admin', 'superAdmin', 'vendor'),
  uploadCategoryImage.single('image'),
  validateRequest(CategoryValidation.updateCategoryValidationSchema),
  CategoryController.updateCategory
)

router.delete(
  '/delete/:id',
  auth('admin', 'superAdmin', 'vendor'),
  CategoryController.deleteCategory
)
router.patch(
  '/change-status/:id',
  auth('admin', 'superAdmin', 'vendor'),
  CategoryController.toggleCategoryPublished
)
export const CategoryRoutes = router
