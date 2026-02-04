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
  auth('admin', 'superAdmin'),
  upload.single('image'),
  validateRequest(CategoryValidation.createCategoryValidationSchema),
  CategoryController.createCategory
)

router.post(
  '/:id/create-subcategory',
  auth('admin', 'superAdmin'),
  upload.single('image'),
  validateRequest(CategoryValidation.subCategoryValidationSchema),
  CategoryController.createSubCategory
)

router.get(
  '/admin',
  auth('admin', 'superAdmin'),
  CategoryController.getAllCategoriesForAdmin
)

router.get('/all', CategoryController.getAllCategoriesForCustomer)
router.get(
  '/:id',

  CategoryController.getSingleCategory
)
router.patch(
  '/:id',
  auth('admin', 'superAdmin'),
  uploadCategoryImage.single('image'),
  validateRequest(CategoryValidation.updateCategoryValidationSchema),
  CategoryController.updateCategory
)
router.patch(
  '/subcategory/:id',
  upload.single('image'),
  auth('admin', 'superAdmin'),
  CategoryController.updateSubCategory
)

router.get('/subcategory/:id', CategoryController.getSingleSubCategory)

router.get('/all/subcategories', CategoryController.getAllSubCategories)

router.delete(
  '/delete',
  auth('admin', 'superAdmin'),
  CategoryController.deleteCategory
)
router.delete(
  '/subcategory/delete',
  auth('admin', 'superAdmin'),
  CategoryController.deleteSubCategory
)
router.patch(
  '/change-status/:id',
  auth('admin', 'superAdmin'),
  CategoryController.toggleCategoryPublished
)
export const CategoryRoutes = router
