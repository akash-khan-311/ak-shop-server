/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose'
import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { Product } from './product.model'
import { SpecTemplateService } from '../specTemplate/specTemplate.service'
import {
  deleteManyFromCloudinary,
  uploadManyToCloudinary
} from '../../helpers/CloudinaryImages'

const buildSpecIndex = (specs: Record<string, any>) => {
  const out: { k: string; v: string }[] = []
  for (const [k, v] of Object.entries(specs || {})) {
    if (v === undefined || v === null || v === '') continue
    if (Array.isArray(v)) v.forEach(item => out.push({ k, v: String(item) }))
    else out.push({ k, v: String(v) })
  }
  return out
}

const createProductIntoDB = async (
  payload: any,
  files?: Express.Multer.File[]
) => {
  // effective fields
  const tpl = await SpecTemplateService.getEffectiveTemplateFromDB(
    payload.subcategorySlug,
    payload.userId 
  )

  let uploadedImages

  if (files) {
    uploadedImages = await uploadManyToCloudinary(files, 'products')
  }

  const fields = tpl.fields || []
  const specs = payload.specifications || {}

  // validate
  for (const f of fields as any[]) {
    const val = specs?.[f.name]
    const empty =
      val === undefined ||
      val === null ||
      val === '' ||
      (Array.isArray(val) && val.length === 0)

    if (!f.optional && empty) {
      throw new AppError(httpStatus.BAD_REQUEST, `${f.label} is required`)
    }

    if (
      !empty &&
      (f.type === 'combobox' || f.type === 'multi-select') &&
      f.options?.length
    ) {
      if (f.type === 'combobox' && !f.options.includes(val)) {
        throw new AppError(httpStatus.BAD_REQUEST, `${f.label} invalid option`)
      }
      if (f.type === 'multi-select' && Array.isArray(val)) {
        for (const item of val) {
          if (!f.options.includes(item)) {
            throw new AppError(
              httpStatus.BAD_REQUEST,
              `${f.label} invalid option: ${item}`
            )
          }
        }
      }
    }
  }

  const userId =
    typeof payload.userId === 'string' &&
      Types.ObjectId.isValid(payload.userId)
      ? Types.ObjectId.createFromHexString(payload.userId)
      : null

  if (!userId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid user Id')
  }

  const doc = await Product.create({
    ...payload,
    images: uploadedImages,
    userId,
    specifications: specs,
    specIndex: buildSpecIndex(specs)
  })

  return doc
}

const updateProductIntoDB = async (
  id: string,
  payload: any,
  files: Express.Multer.File[]
) => {
  const product = await Product.findOne({ _id: id, isDeleted: false })
  if (!product) throw new AppError(httpStatus.NOT_FOUND, 'Product not found 😒')

  // remove images requested
  const removePublicIds: string[] = payload.removeImagePublicIds || []
  if (removePublicIds.length) {
    await deleteManyFromCloudinary(removePublicIds)

    // Use product.images as a Mongoose DocumentArray
    if (product.images && typeof (product.images as any).id === 'function') {
      for (const publicId of removePublicIds) {
        const imgDoc = product.images.find(
          (img: any) => img.public_id === publicId
        )
        if (imgDoc) {
          const imgSubdoc = product.images.id((imgDoc as any)._id)
          if (imgSubdoc && typeof (imgSubdoc as any).deleteOne === 'function') {
            ; (imgSubdoc as any).deleteOne()
          }
        }
      }
    } else {
      // fallback for plain arrays - convert to array, filter, then use push/create
      const currentImages = Array.from(product.images || [])
      const filteredImages = currentImages.filter(
        (img: any) => !removePublicIds.includes(img.public_id)
      )
      // Clear and repopulate using Mongoose DocumentArray methods
      product.images.splice(0, product.images.length)
      filteredImages.forEach((img: any) => {
        product.images.push(img)
      })
    }

    // upload new images
    if (files?.length) {
      const uploaded = await uploadManyToCloudinary(files, 'products')
      uploaded.forEach((img: any) => {
        product.images.push(img)
      })
    }
  }

  // update other fields
  Object.assign(product, payload)
  delete (product as any).removeImagePublicIds

  const result = await product.save()
  return result
}
const deleteProductFromDB = async (id: string) => {
  const product = await Product.findOne({ _id: id, isDeleted: false })
  if (!product) throw new AppError(httpStatus.NOT_FOUND, 'Product not found 😒')

  const publicIds = (product.images || []).map((img: any) => img.public_id)
  await deleteManyFromCloudinary(publicIds)

  product.isDeleted = true
  await product.save()

  return { message: 'Product deleted successfully ✅' }
}
export const ProductService = {
  createProductIntoDB,
  updateProductIntoDB,
  deleteProductFromDB
}
