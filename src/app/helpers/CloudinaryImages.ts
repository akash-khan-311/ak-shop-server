/* eslint-disable @typescript-eslint/no-unused-vars */

import httpStatus from 'http-status'
import { cloudinary } from '../config/cloudinary'
import AppError from '../errors/AppError'

export const uploadManyToCloudinary = async (
  files: Express.Multer.File[] = [],
  folder = 'products'
) => {
  try {
    const uploads = await Promise.all(
      files.map(async file => {
        const uploadResult = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
          { folder }
        )
        return {
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id
        }
      })
    )

    return uploads
  } catch (err) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Images upload failed 😒'
    )
  }
}

export const deleteManyFromCloudinary = async (publicIds: string[] = []) => {
  if (!publicIds.length) return
  await Promise.all(publicIds.map(id => cloudinary.uploader.destroy(id)))
}
