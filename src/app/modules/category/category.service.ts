import AppError from '../../errors/AppError'
import { TCategory, TSubCategory } from './category.interface'
import { Category } from './category.model'
import httpStatus from 'http-status'
export const createCategoryIntoDB = async (payload: TCategory) => {
  const isExists = await Category.findOne({ name: payload.name })
  if (isExists) {
    throw new Error('Category already exists 🙂')
  }
  const category = await Category.create(payload)
  return category
}
export const createSubCategoryIntoDb = async (
  id: string,
  payload: TSubCategory
) => {
  const category = await Category.findById(id)
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
  const category = await Category.findById(id)
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found for update 😒')
  }
  category.published = !category.published
  await category.save()
  return category
}

export const updateCategoryIntoDb = async (
  id: string,
  payload: Partial<TCategory>
) => {
  const isExists = await Category.findOne({ _id: id })
  if (!isExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found 😒')
  }
  const result = await Category.findOneAndUpdate({ _id: id }, payload, {
    new: true,
    runValidators: true
  })
  return result
}

export const deleteCategoryFromDb = async (id: string) => {
  const isExists = await Category.findOne({ _id: id })
  if (!isExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found for update 😒')
  }
  const result = await Category.findOneAndDelete({ _id: id })
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
