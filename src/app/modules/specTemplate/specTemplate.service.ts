/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose'
import { SpecTemplate } from './specTemplate.model'
import { TSpecField } from './specTemplate.interface'

const createSpecTemplateIntoDB = async (payload: any) => {
  const userId =
    typeof payload.userId === 'string' &&
      Types.ObjectId.isValid(payload.userId)
      ? Types.ObjectId.createFromHexString(payload.userId)
      : null

  const doc = await SpecTemplate.findOneAndUpdate(
    { subcategorySlug: payload.subcategorySlug,  userId, isDeleted: false },
    {
      categorySlug: payload.categorySlug,
      subcategorySlug: payload.subcategorySlug,
      userId,
      fields: (payload.fields || []).map((f: any, idx: number) => ({
        ...f,
        order: f.order ?? idx
      })),
      isPublished: payload.isPublished ?? true
    },
    { upsert: true, new: true, runValidators: true }
  )

  return doc
}

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

  const userObjectId =
    typeof userId === 'string' && Types.ObjectId.isValid(userId)
      ? Types.ObjectId.createFromHexString(userId)
      : null

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
  baseFields.forEach(f => map.set(f.name, f))
  vendorFields.forEach(f => map.set(f.name, f))

  const fields = Array.from(map.values()).sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  )

  return {
    subcategorySlug,
    fields
  }
}

export const SpecTemplateService = {
  createSpecTemplateIntoDB,
  getEffectiveTemplateFromDB
}
