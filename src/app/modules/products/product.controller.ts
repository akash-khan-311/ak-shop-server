import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import httpStatus from 'http-status'
import { ProductService } from './product.service'

export const createProduct = catchAsync(async (req, res) => {
  // specifications may come as string in form-data
  if (typeof req.body.specifications === 'string') {
    req.body.specifications = JSON.parse(req.body.specifications)
  }

  const files = (req.files as Express.Multer.File[]) || []
  const result = await ProductService.createProductIntoDB(req.body, files)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Product created successfully',
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
  const id = req.params.id
  const result = await ProductService.deleteProductFromDB(id)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Product deleted successfully',
    data: result
  })
})
export const ProductController = { createProduct, updateProduct, deleteProduct }
