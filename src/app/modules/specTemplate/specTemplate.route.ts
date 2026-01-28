import express from 'express'
import auth from '../../middlewares/auth'
import validateRequest from '../../middlewares/validateRequest'
import { SpecTemplateValidation } from './specTemplate.validation'
import { SpecTemplateController } from './specTemplate.controller'

const router = express.Router()

router.post(
  '/create',
  auth('admin', 'superAdmin', 'vendor'),
  validateRequest(SpecTemplateValidation.createSpecTemplateSchema),
  SpecTemplateController.createSpecTemplate
)
router.get(
  '/',
  auth('admin', 'superAdmin', 'vendor'),
  SpecTemplateController.getTemplates
)
router.get(
  '/:id',
  auth('admin', 'superAdmin', 'vendor'),
  SpecTemplateController.getTemplateById
)

router.patch(
  '/:id',
  auth('admin', 'superAdmin', 'vendor'),
  validateRequest(SpecTemplateValidation.updateSpecTemplateSchema),
  SpecTemplateController.updateTemplate
)
// Frontend fetch template by subcategorySlug
router.get(
  '/effective/:subcategorySlug',
  auth('admin', 'superAdmin', 'vendor'),
  SpecTemplateController.getEffectiveSpecTemplate
)

router.delete(
  '/delete',
  auth('admin', 'superAdmin', 'vendor'),
  validateRequest(SpecTemplateValidation.deleteSpecTemplateSchema),
  SpecTemplateController.deleteTemplates
)
router.patch(
  '/change-status/:id',
  auth('admin', 'superAdmin', 'vendor'),
  SpecTemplateController.toggleTemplatePublished
)

export const SpecTemplateRoutes = router
