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

// Frontend fetch template by subcategorySlug
router.get(
  '/effective/:subcategorySlug',
  auth('admin', 'superAdmin', 'vendor'),
  SpecTemplateController.getEffectiveSpecTemplate
)

export const SpecTemplateRoutes = router
