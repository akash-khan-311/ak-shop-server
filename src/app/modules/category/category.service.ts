/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { name } from 'eslint-plugin-prettier/recommended'
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
    throw new AppError(httpStatus.CONFLICT, 'Category already exists 🙂')
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
  payload: TSubCategory,
  file?: Express.Multer.File
) => {
  const category = await Category.findOne({ _id: id, isDeleted: false })
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found 😒')
  }

  const subcategories = category.subcategories as unknown as Array<{
    slug: string
  }>
  const isExists = subcategories?.find(subCat => subCat.slug === payload.slug)

  if (isExists) {
    throw new AppError(
      httpStatus.CONFLICT,
      'Subcategory already exists in this category 😒'
    )
  }
  let imageData = undefined

  if (file) {
    try {
      const uploadResult = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          folder: 'subcategories'
        }
      )

      imageData = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id
      }
    } catch (error) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Subcategory image upload failed 😒'
      )
    }
  }

  ; (category.subcategories as unknown as any[])?.push({
    ...payload,
    image: imageData,
    brands: payload.brands || []
  })
  await category.save()
  return category
}

export const getAllSubCategoriesFromDB = async () => {
  const result = await Category.find(
    {
      isDeleted: false,
      subcategories: { $exists: true, $ne: [] }
    },
    { name: 1, published: 1, subcategories: 1 }
  )

  const categories = result as any[]
  const subCategories = categories.flatMap(category => {
    const cat = category as any
    const subcategories = cat.subcategories as any[]

    return subcategories
      .filter(sub => !sub.isDeleted)
      .map(sub => ({
        _id: sub._id,
        name: sub.name,
        slug: sub.slug,
        brands: sub.brands,
        published: cat.published,
        image: sub.image,
        categoryId: cat._id,
        categoryName: cat.name
      }))
  })

  return subCategories
}

export const getSingleSubCategoryFromDb = async (id: string) => {
  const category = await Category.findOne(
    { 'subcategories._id': id, isDeleted: false },
    { name: 1, subcategories: 1 }
  )

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subcategory not found 😒')
  }

  const cat = category as any
  const subcategories = (cat.subcategories as any[]) || []
  const subCategory = subcategories.find(
    sub => sub?._id?.toString() === id && !sub.isDeleted
  )

  if (!subCategory) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subcategory not found 😒')
  }
  return {
    _id: subCategory._id,
    name: subCategory.name,
    slug: subCategory.slug,
    brands: subCategory.brands || [],
    published: cat.published,
    image: subCategory?.image,
    categoryId: cat._id,
    categoryName: cat.name
  }
}

export const getAllCategoriesForVendorAndAdminFromDB = async () => {
  const categories = await Category.find({ isDeleted: false })
  return categories
}

export const getAllCategoriesForCustomer = async () => {
  const categories = await Category.find({ isDeleted: false, published: true })
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
export const updateSubCategoryIntoDb = async (
  id: string,
  payload: {
    name: string
    slug: string
    categoryId: string
    brands: string[]
  },
  newImageFile?: Express.Multer.File
) => {
  const { name, slug, categoryId, brands } = payload

  // 🔎 find category that currently owns this subcategory
  const currentCategory = await Category.findOne({
    'subcategories._id': id,
    isDeleted: false
  })

  if (!currentCategory) {
    throw new AppError(httpStatus.NOT_FOUND, 'Sub Category not found 😒')
  }

  const subcategories = currentCategory.subcategories as any[]
  const subCategory = subcategories.find(sub => sub._id.toString() === id)

  if (!subCategory) {
    throw new AppError(httpStatus.NOT_FOUND, 'Sub Category not found 😒')
  }

  /* ---------------- IMAGE HANDLE ---------------- */
  let imageData = subCategory.image // default → keep old image

  if (newImageFile) {
    // 🗑 delete old image
    if (subCategory.image?.public_id) {
      await cloudinary.uploader.destroy(subCategory.image.public_id)
    }

    // ⬆ upload new image
    const uploadResult = await cloudinary.uploader.upload(
      `data:${newImageFile.mimetype};base64,${newImageFile.buffer.toString(
        'base64'
      )}`,
      {
        folder: 'subcategories'
      }
    )

    imageData = {
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id
    }
  }

  /* ---------------- SAME CATEGORY ---------------- */
  const isCategoryChanged = currentCategory._id.toString() !== categoryId

  if (!isCategoryChanged) {
    await Category.updateOne(
      {
        _id: currentCategory._id,
        'subcategories._id': id
      },
      {
        $set: {
          'subcategories.$.name': name,
          'subcategories.$.slug': slug,
          'subcategories.$.brands': brands,
          'subcategories.$.image': imageData
        }
      }
    )

    return true
  }

  /* ---------------- CATEGORY CHANGED ---------------- */

  // remove from old category
  await Category.updateOne(
    { _id: currentCategory._id },
    { $pull: { subcategories: { _id: id } } }
  )

  // push into new category
  await Category.updateOne(
    { _id: categoryId },
    {
      $push: {
        subcategories: {
          _id: subCategory._id,
          name,
          slug,
          brands,
          image: imageData
        }
      }
    }
  )

  return true
}

export const deleteCategoryFromDb = async (ids: string[]) => {
  const categories = await Category.find({
    _id: { $in: ids },
    isDeleted: false
  })
  if (!categories.length) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found for delete 😒')
  }
  /* 🔥 Delete images from Cloudinary */
  for (const category of categories) {
    if (category.image?.public_id) {
      await cloudinary.uploader.destroy(category.image.public_id)
    }
  }
  const result = await Category.updateMany(
    { _id: { $in: ids } },
    { isDeleted: true, published: false }
  )

  return result
}

export const deleteSubCategoriesFromDb = async (subCategoryIds: string[]) => {
  if (!subCategoryIds.length) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No SubCategory IDs provided 😒')
  }

  const categories = await Category.find({
    'subcategories._id': { $in: subCategoryIds }
  })

  if (!categories.length) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'SubCategory not found in any category 😒'
    )
  }

  for (const category of categories) {
    let updated = false

    for (const sub of category.subcategories) {
      const subDoc = sub as any
      if (subCategoryIds.includes(subDoc._id.toString()) && !subDoc.isDeleted) {
        await cloudinary.uploader.destroy(subDoc.image.public_id)
        subDoc.isDeleted = true
        updated = true
      }
    }

    if (updated) {
      await category.save()
    }
  }

  return { message: 'Selected subCategories deleted successfully ✅' }
}

export const CategoryService = {
  getAllCategoriesForCustomer,
  createCategoryIntoDB,
  getAllCategoriesForVendorAndAdminFromDB,
  getSingleCategoryFromDb,
  updateCategoryIntoDb,
  deleteCategoryFromDb,
  toggleCategoryPublishIntoDb,
  createSubCategoryIntoDb,
  getAllSubCategoriesFromDB,
  getSingleSubCategoryFromDb,
  updateSubCategoryIntoDb,
  deleteSubCategoriesFromDb
}
