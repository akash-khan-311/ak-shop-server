/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status'
import { Types } from 'mongoose'
import AppError from '../../errors/AppError'
import { SpecTemplate } from './specTemplate.model'
import { TSpecField } from './specTemplate.interface'

const toObjectIdOrNull = (id?: string | null) => {
  if (!id) return null
  if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
    return Types.ObjectId.createFromHexString(id)
  }
  return null
}

// ✅ create/upsert (your existing) - keep but fix filter a bit
const createSpecTemplateIntoDB = async (payload: any) => {
  const userId = toObjectIdOrNull(payload.userId)

  const doc = await SpecTemplate.findOneAndUpdate(
    {
      categorySlug: payload.categorySlug,
      subcategorySlug: payload.subcategorySlug,
      userId,
      isDeleted: false
    },
    {
      categorySlug: payload.categorySlug,
      subcategorySlug: payload.subcategorySlug,
      userId,
      fields: (payload.fields || []).map((f: any, idx: number) => ({
        ...f,
        order: f.order ?? idx,
        options:
          f.type === 'combobox' || f.type === 'multi-select'
            ? (f.options || []).map((x: string) => x.trim()).filter(Boolean)
            : []
      })),
      isPublished: payload.isPublished ?? true
    },
    { upsert: true, new: true, runValidators: true }
  )

  return doc
}

// ✅ list templates (dashboard)
const getTemplatesFromDB = async (userId?: string) => {
  const userObjectId = toObjectIdOrNull(userId)

  const filter: any = { isDeleted: false }
  if (userId !== undefined) {
    // if provided, filter by that user only
    filter.userId = userObjectId
  }

  const docs = await SpecTemplate.find(filter).sort({ updatedAt: -1 })
  return docs
}

// ✅ single template
const getTemplateByIdFromDB = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid template id')
  }

  const doc = await SpecTemplate.findOne({ _id: id, isDeleted: false })
  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Template not found')
  }
  return doc
}

// ✅ update template (edit)
const updateTemplateIntoDB = async (id: string, payload: any) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid template id')
  }

  const existing = await SpecTemplate.findOne({ _id: id, isDeleted: false })
  if (!existing) throw new AppError(httpStatus.NOT_FOUND, 'Template not found')

  // if userId passed
  const userId =
    payload.userId !== undefined ? toObjectIdOrNull(payload.userId) : existing.userId

  const updateDoc: any = {}

  if (payload.categorySlug) updateDoc.categorySlug = payload.categorySlug
  if (payload.subcategorySlug) updateDoc.subcategorySlug = payload.subcategorySlug
  if (payload.isPublished !== undefined) updateDoc.isPublished = payload.isPublished

  if (payload.fields) {
    updateDoc.fields = (payload.fields || []).map((f: any, idx: number) => ({
      ...f,
      order: f.order ?? idx,
      options:
        f.type === 'combobox' || f.type === 'multi-select'
          ? (f.options || []).map((x: string) => x.trim()).filter(Boolean)
          : []
    }))
  }

  updateDoc.userId = userId

  // ✅ IMPORTANT: prevent duplicate conflict if you enforce unique key
  // if there is already another template with same (categorySlug, subcategorySlug, userId)
  const newCategorySlug = updateDoc.categorySlug ?? existing.categorySlug
  const newSubcategorySlug = updateDoc.subcategorySlug ?? existing.subcategorySlug

  const duplicate = await SpecTemplate.findOne({
    _id: { $ne: existing._id },
    categorySlug: newCategorySlug,
    subcategorySlug: newSubcategorySlug,
    userId,
    isDeleted: false
  })

  if (duplicate) {
    throw new AppError(
      httpStatus.CONFLICT,
      'Another template already exists for this category/subcategory'
    )
  }

  const updated = await SpecTemplate.findOneAndUpdate(
    { _id: id },
    updateDoc,
    { new: true, runValidators: true }
  )

  return updated
}

// ✅ effective template (base + vendor merge)
const getEffectiveTemplateFromDB = async (
  subcategorySlug: string,
  userId?: string
) => {
  const base = await SpecTemplate.findOne({
    subcategorySlug,
    userId: null,
    isDeleted: false,
    isPublished: true
  })

  const userObjectId = toObjectIdOrNull(userId)

  const vendor = userObjectId
    ? await SpecTemplate.findOne({
      subcategorySlug,
      userId: userObjectId,
      isDeleted: false,
      isPublished: true
    })
    : null

  const baseFields: TSpecField[] = (base?.fields || []) as any
  const vendorFields: TSpecField[] = (vendor?.fields || []) as any

  // merge by name (vendor overrides)
  const map = new Map<string, TSpecField>()
  baseFields.forEach((f) => map.set(f.name, f))
  vendorFields.forEach((f) => map.set(f.name, f))

  const fields = Array.from(map.values()).sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  )

  return {
    subcategorySlug,
    fields
  }
}

// ✅ delete single/multiple
const deleteTemplatesFromDB = async (ids: string[]) => {
  const templates = await SpecTemplate.find({
    _id: { $in: ids },
    isDeleted: false
  })
  if (!templates.length) throw new AppError(httpStatus.NOT_FOUND, 'Category not found for delete 😒')
  const result = await SpecTemplate.updateMany(
    { _id: { $in: ids } },
    { isDeleted: true, published: false }
  )
  return result
}

export const toggleTemplatePublishIntoDb = async (id: string) => {
  const template = await SpecTemplate.findOne({ _id: id, isDeleted: false })
  if (!template) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found for update 😒')
  }
  template.isPublished = !template.isPublished
  await template.save()
  return template
}

export const SpecTemplateService = {
  createSpecTemplateIntoDB,
  getTemplatesFromDB,
  getTemplateByIdFromDB,
  updateTemplateIntoDB,
  getEffectiveTemplateFromDB,
  deleteTemplatesFromDB,
  toggleTemplatePublishIntoDb
}
