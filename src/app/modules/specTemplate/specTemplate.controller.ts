/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import httpStatus from 'http-status'
import { SpecTemplateService } from './specTemplate.service'

export const createSpecTemplate = catchAsync(async (req, res) => {
  const userId = (req.user as any)?._id;
  const payload = {
    ...req.body,
    adminId: userId
  }
  const result = await SpecTemplateService.createSpecTemplateIntoDB(payload)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Spec template saved successfully',
    data: result
  })
})

export const getTemplatesForUser = catchAsync(async (req, res) => {
  const userId = req.query.userId as string | undefined
  const result = await SpecTemplateService.getTemplatesForUserFromDB(userId)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Templates fetched successfully',
    data: result
  })
})
export const getTemplatesForAdmin = catchAsync(async (req, res) => {
  const result = await SpecTemplateService.getTemplatesForAdminFromDb()

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Templates fetched successfully',
    data: result
  })
})
export const getTemplateById = catchAsync(async (req, res) => {
  const { id } = req.params
  const result = await SpecTemplateService.getTemplateByIdFromDB(id)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Template fetched successfully',
    data: result
  })
})

export const updateTemplate = catchAsync(async (req, res) => {
  const { id } = req.params
  const result = await SpecTemplateService.updateTemplateIntoDB(id, req.body)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Template updated successfully',
    data: result
  })
})

export const getEffectiveSpecTemplate = catchAsync(async (req, res) => {
  const { subcategorySlug } = req.params

  console.log('this is subcategory slug', subcategorySlug)
  const result = await SpecTemplateService.getEffectiveTemplateFromDB(subcategorySlug)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Spec template fetched successfully',
    data: result
  })
})

export const deleteTemplates = catchAsync(async (req, res) => {
  const { ids } = req.body

  const result = await SpecTemplateService.deleteTemplatesFromDB(ids)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message:
      ids.length > 1
        ? 'Templates deleted successfully'
        : 'Template deleted successfully',
    data: result
  })
})

export const toggleTemplatePublished = catchAsync(async (req, res) => {
  const id = req.params.id
  const result = await SpecTemplateService.toggleTemplatePublishIntoDb(id)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `Template ${result.isPublished ? 'published' : 'unpublished'
      } successfully`,
    data: result
  })
})


export const SpecTemplateController = {
  createSpecTemplate,
  getTemplatesForAdmin,
  getEffectiveSpecTemplate,
  getTemplatesForUser,
  getTemplateById,
  updateTemplate,
  deleteTemplates,
  toggleTemplatePublished
}
