/* eslint-disable prettier/prettier */
import { Types } from "mongoose"

export type TSpecFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'combobox'
  | 'boolean'
  | 'multi-select'

export type TSpecField = {
  label: string
  name: string
  type: TSpecFieldType
  options?: string[]
  optional?: boolean
  unit?: string
  order?: number
}

export type TSpecTemplate = {
  categorySlug?: string
  subcategorySlug: string
  adminId?: Types.ObjectId
  fields: TSpecField[]
  isPublished?: boolean
  isDeleted?: boolean
}
