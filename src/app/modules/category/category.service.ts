/* eslint-disable @typescript-eslint/no-unused-vars */
import { cloudinary } from '../../config/cloudinary'
import AppError from '../../errors/AppError'
import { TCategory, TSubCategory } from './category.interface'
import { Category } from './category.model'
import httpStatus from 'http-status'
export const createCategoryIntoDB = async (
  payload: TCategory,
  file?: Express.Multer.File
) => {
  const isExists = await Category.findOne({
    name: payload.name,
    isDeleted: false
  })
  if (isExists) {
    throw new Error('Category already exists 🙂')
  }
  let imageData = undefined

  if (file) {
    try {
      const uploadResult = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          folder: 'categories'
        }
      )

      imageData = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id
      }
    } catch (err) {
      throw new AppError(500, 'Image upload failed 😒')
    }
  }
  const category = await Category.create({ ...payload, image: imageData })

  return category
}
export const createSubCategoryIntoDb = async (
  id: string,
  payload: TSubCategory
) => {
  const category = await Category.findOne({ _id: id, isDeleted: false })
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found 😒')
  }
  const isExists = category.subcategories?.find(
    (subCat: TSubCategory) => subCat.slug === payload.slug
  )

  if (isExists) {
    throw new AppError(
      httpStatus.CONFLICT,
      'Subcategory already exists in this category 😒'
    )
  }
  category.subcategories?.push(payload)
  await category.save()
  return category
}
export const getAllCategoriesFromDB = async () => {
  const categories = await Category.find({ isDeleted: false })
  return categories
}

export const getSingleCategoryFromDb = async (id: string) => {
  const category = await Category.findOne({ _id: id, isDeleted: false })
  return category
}

export const toggleCategoryPublishIntoDb = async (id: string) => {
  const category = await Category.findOne({ _id: id, isDeleted: false })
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found for update 😒')
  }
  category.published = !category.published
  await category.save()
  return category
}

export const updateCategoryIntoDb = async (
  id: string,
  payload: Partial<TCategory>,
  newImageFile?: Express.Multer.File
) => {
  const category = await Category.findOne({ _id: id, isDeleted: false })
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found 😒')
  }

  if (newImageFile) {
    if (category.image?.public_id) {
      await cloudinary.uploader.destroy(category.image.public_id)
    }

    const uploaded = await cloudinary.uploader.upload(newImageFile.path, {
      folder: 'categories'
    })

    payload.image = {
      url: uploaded.secure_url,
      public_id: uploaded.public_id
    }
  }
  const result = await Category.findOneAndUpdate({ _id: id }, payload, {
    new: true,
    runValidators: true
  })
  return result
}

export const deleteCategoryFromDb = async (id: string) => {
  const category = await Category.findOne({ _id: id })
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found for update 😒')
  }
  if (category?.image?.public_id) {
    await cloudinary.uploader.destroy(category.image.public_id)
  }
  const result = await Category.findByIdAndUpdate(
    { _id: id },
    { isDeleted: true },
    { new: true }
  )
  return result
}

export const CategoryService = {
  createCategoryIntoDB,
  getAllCategoriesFromDB,
  getSingleCategoryFromDb,
  updateCategoryIntoDb,
  deleteCategoryFromDb,
  toggleCategoryPublishIntoDb,
  createSubCategoryIntoDb
}
