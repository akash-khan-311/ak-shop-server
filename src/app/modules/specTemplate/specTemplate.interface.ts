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

  userId?: string | null

  fields: TSpecField[]
  isPublished?: boolean
  isDeleted?: boolean
}
