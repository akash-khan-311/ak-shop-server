/* eslint-disable prettier/prettier */
import express from 'express'
import auth from '../../middlewares/auth'
import validateRequest from '../../middlewares/validateRequest'
import { SpecTemplateValidation } from './specTemplate.validation'
import { SpecTemplateController } from './specTemplate.controller'

const router = express.Router()

router.post(
  '/create',
  auth('admin', 'superAdmin'),
  validateRequest(SpecTemplateValidation.createSpecTemplateSchema),
  SpecTemplateController.createSpecTemplate
)
router.get(
  '/',

  SpecTemplateController.getTemplatesForUser
)
router.get(
  '/admin',
  auth('admin', 'superAdmin'),
  SpecTemplateController.getTemplatesForAdmin
)

router.get(
  '/:id',
  auth('admin', 'superAdmin'),
  SpecTemplateController.getTemplateById
)

router.patch(
  '/:id',
  auth('admin', 'superAdmin'),
  validateRequest(SpecTemplateValidation.updateSpecTemplateSchema),
  SpecTemplateController.updateTemplate
)
// Frontend fetch template by subcategorySlug
router.get(
  '/effective/:subcategorySlug',
  auth('admin', 'superAdmin'),
  SpecTemplateController.getEffectiveSpecTemplate
)

router.delete(
  '/delete',
  auth('admin', 'superAdmin'),
  validateRequest(SpecTemplateValidation.deleteSpecTemplateSchema),
  SpecTemplateController.deleteTemplates
)
router.patch(
  '/change-status/:id',
  auth('admin', 'superAdmin'),
  SpecTemplateController.toggleTemplatePublished
)

export const SpecTemplateRoutes = router
