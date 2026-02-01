/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import AppError from '../../errors/AppError'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { CategoryService } from './category.service'
import httpStatus from 'http-status'
import { CategoryValidation } from './category.validation'
export const createCategory = catchAsync(async (req, res) => {
  let subcategories = []
  if (req.body.subcategories) {
    try {
      subcategories = JSON.parse(req.body.subcategories)
    } catch (err) {
      throw new AppError(400, 'Invalid subcategories form')
    }
  }
  const parsed = CategoryValidation.createCategoryValidationSchema.safeParse({
    body: {
      name: req.body.name,
      slug: req.body.slug,
      subcategories
    }
  })

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: parsed.error.errors
    })
  }


  const userId = (req.user as any)?._id;
  const payload = {
    ...req.body,
    adminId: userId
  }

  const result = await CategoryService.createCategoryIntoDB(payload, req.file)
  if (result) {
    sendResponse(res, {
      status: httpStatus.OK,
      success: true,
      message: 'Category created successfully',
      data: result
    })
  }
})

export const createSubCategory = catchAsync(async (req, res) => {
  const id = req.params.id
  if (typeof req.body.brands === 'string') {
    req.body.brands = JSON.parse(req.body.brands)
  }
  const userId = (req.user as any)?._id;
  const payload = {
    ...req.body,
    adminId: userId
  }
  const result = await CategoryService.createSubCategoryIntoDb(
    id,
    payload,
    req.file
  )
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Subcategory created successfully',
    data: result
  })
})
export const getSingleSubCategory = catchAsync(async (req, res) => {
  const id = req.params.id
  const result = await CategoryService.getSingleSubCategoryFromDb(id)
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Subcategory found successfully',
    data: result
  })
})
export const updateSubCategory = catchAsync(async (req, res) => {
  const id = req.params.id
  const newImageFile = req.file
  if (typeof req.body.brands === 'string') {
    req.body.brands = JSON.parse(req.body.brands)
  }

  const result = await CategoryService.updateSubCategoryIntoDb(
    id,
    req.body,
    newImageFile
  )
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Updated sub Category successfully',
    data: result
  })
})

export const getAllSubCategories = catchAsync(async (req, res) => {
  const result = await CategoryService.getAllSubCategoriesFromDB()

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Subcategories fetched successfully',
    data: result
  })
})

export const getAllCategoriesForAdmin = catchAsync(async (req, res) => {
  const result = await CategoryService.getAllCategoriesForAdminFromDB()
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Fetched All Categories',
    data: result
  })
})
export const getAllCategoriesForCustomer = catchAsync(async (req, res) => {
  const result = await CategoryService.getAllCategoriesForCustomer()
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Fetched All Categories',
    data: result
  })
})



export const getSingleCategory = catchAsync(async (req, res) => {
  const id = req.params.id
  const result = await CategoryService.getSingleCategoryFromDb(id)
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Category found successfully',
    data: result
  })
})

export const updateCategory = catchAsync(async (req, res) => {
  const id = req.params.id
  const newImageFile = req.file
  const result = await CategoryService.updateCategoryIntoDb(
    id,
    req.body,
    newImageFile
  )
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Category updated successfully',
    data: result
  })
})

export const toggleCategoryPublished = catchAsync(async (req, res) => {
  const id = req.params.id
  const result = await CategoryService.toggleCategoryPublishIntoDb(id)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `Category ${result.published ? 'published' : 'unpublished'
      } successfully`,
    data: result
  })
})

export const deleteCategory = catchAsync(async (req, res) => {
  const { ids } = req.body
  const result = await CategoryService.deleteCategoryFromDb(ids)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message:
      ids.length > 1
        ? 'Categories deleted successfully'
        : 'Category deleted successfully',
    data: result
  })
})

export const deleteSubCategory = catchAsync(async (req, res) => {
  const { ids } = req.body
  const result = await CategoryService.deleteSubCategoriesFromDb(ids)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message:
      ids.length > 1
        ? 'Sub Categories deleted successfully'
        : 'Sub Category deleted successfully',
    data: result
  })
})

export const CategoryController = {
  createCategory, getAllCategoriesForCustomer, getAllCategoriesForAdmin,
  getSingleCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryPublished,
  createSubCategory,
  getAllSubCategories,
  getSingleSubCategory,
  updateSubCategory,
  deleteSubCategory
}
