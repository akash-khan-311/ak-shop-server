/* eslint-disable @typescript-eslint/no-explicit-any */
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import httpStatus from 'http-status'
import { ProductService } from './product.service'

export const createProduct = catchAsync(async (req, res) => {
  // specifications may come as string in form-data
  if (typeof req.body.specifications === 'string') {
    req.body.specifications = JSON.parse(req.body.specifications)
  }

  const userId = (req.user as any)?._id
  const payload = {
    ...req.body,
    adminId: userId
  }

  const files = (req.files as Express.Multer.File[]) || []
  const result = await ProductService.createProductIntoDB(payload, files)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Product created successfully',
    data: result
  })
})
export const getAllProducts = catchAsync(async (req, res) => {
  const result = await ProductService.getAllProductFromDb()
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Products fetched successfully',
    data: result
  })
})
export const getAllProductsForAdmin = catchAsync(async (req, res) => {
  const result = await ProductService.getAllProductsForAdminFromDb()
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Products fetched successfully',
    data: result
  })
})
export const togglePublishProduct = catchAsync(async (req, res) => {
  const id = req.params.id
  const result = await ProductService.togglePublishProductIntoDb(id)
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Product published successfully',
    data: result
  })
})
export const getSingleProduct = catchAsync(async (req, res) => {
  const id = req.params.id
  const result = await ProductService.getSingleProductFromDb(id)
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Product fetched successfully',
    data: result
  })
})
export const updateProduct = catchAsync(async (req, res) => {
  const id = req.params.id

  if (typeof req.body.specifications === 'string') {
    req.body.specifications = JSON.parse(req.body.specifications)
  }

  if (typeof req.body.removeImagePublicIds === 'string') {
    req.body.removeImagePublicIds = JSON.parse(req.body.removeImagePublicIds)
  }

  const files = (req.files as Express.Multer.File[]) || []
  const result = await ProductService.updateProductIntoDB(id, req.body, files)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Product updated successfully',
    data: result
  })
})

export const deleteProduct = catchAsync(async (req, res) => {
  const { ids } = req.body
  const result = await ProductService.deleteProductFromDB(ids)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Product deleted successfully',
    data: result
  })
})
export const ProductController = {
  createProduct,
  getAllProductsForAdmin,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  togglePublishProduct
}
