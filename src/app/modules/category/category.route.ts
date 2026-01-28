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
  auth('admin', 'superAdmin', 'vendor'),
  upload.single('image'),
  validateRequest(CategoryValidation.createCategoryValidationSchema),
  CategoryController.createCategory
)

router.post(
  '/:id/create-subcategory',
  auth('admin', 'superAdmin', 'vendor'),
  upload.single('image'),
  validateRequest(CategoryValidation.subCategoryValidationSchema),
  CategoryController.createSubCategory
)

router.get(
  '/vendor',
  auth('admin', 'vendor', 'superAdmin'),
  CategoryController.getAllCategoriesForAdminAndVendor
)

router.get('/all', CategoryController.getAllCategoriesForCustomer)
router.get(
  '/:id',

  CategoryController.getSingleCategory
)
router.patch(
  '/:id',
  auth('admin', 'superAdmin', 'vendor'),
  uploadCategoryImage.single('image'),
  validateRequest(CategoryValidation.updateCategoryValidationSchema),
  CategoryController.updateCategory
)
router.patch(
  '/subcategory/:id',
  upload.single('image'),
  auth('admin', 'vendor', 'superAdmin'),
  CategoryController.updateSubCategory
)

router.get('/subcategory/:id', CategoryController.getSingleSubCategory)

router.get('/all/subcategories', CategoryController.getAllSubCategories)

router.delete(
  '/delete',
  auth('admin', 'superAdmin', 'vendor'),
  CategoryController.deleteCategory
)
router.delete(
  '/subcategory/delete',
  auth('admin', 'vendor', 'superAdmin'),
  CategoryController.deleteSubCategory
)
router.patch(
  '/change-status/:id',
  auth('admin', 'superAdmin', 'vendor'),
  CategoryController.toggleCategoryPublished
)
export const CategoryRoutes = router
