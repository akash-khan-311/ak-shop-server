import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { CategoryService } from './category.service'
import httpStatus from 'http-status'
export const createCategory = catchAsync(async (req, res) => {
  const result = await CategoryService.createCategoryIntoDB(req.body)
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
  const result = await CategoryService.createSubCategoryIntoDb(id, req.body)
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Subcategory created successfully',
    data: result
  })
})

export const getAllCategories = catchAsync(async (req, res) => {
  const result = await CategoryService.getAllCategoriesFromDB()
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
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
  const result = await CategoryService.updateCategoryIntoDb(id, req.body)
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
    message: 'Category updated successfully',
    data: result
  })
})

export const deleteCategory = catchAsync(async (req, res) => {
  const result = await CategoryService.deleteCategoryFromDb(req.params.id)
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Category deleted successfully',
    data: result
  })
})

export const CategoryController = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryPublished,
  createSubCategory
}
