import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import httpStatus from 'http-status'
import { SpecTemplateService } from './specTemplate.service'

export const createSpecTemplate = catchAsync(async (req, res) => {
  const result = await SpecTemplateService.createSpecTemplateIntoDB(req.body)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Spec template saved successfully',
    data: result
  })
})

export const getEffectiveSpecTemplate = catchAsync(async (req, res) => {
  const { subcategorySlug } = req.params
  const userId = req.query.userId as string | undefined

  const result = await SpecTemplateService.getEffectiveTemplateFromDB(
    subcategorySlug,
    userId
  )

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Spec template fetched successfully',
    data: result
  })
})

export const SpecTemplateController = {
  createSpecTemplate,
  getEffectiveSpecTemplate
}
