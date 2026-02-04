export type AuthProvider = 'local' | 'google' | 'facebook' | 'github'
export type AddressType = 'shipping' | 'billing'
export type TUserAvatar = {
  url: string
  public_id?: string
}
export interface IUserAddress {
  _id?: string
  label?: string
  type: AddressType
  division?: string
  district?: string
  upazila?: string
  union?: string
  fullAddress: string
  phone?: string
  isDefault?: boolean
  createdAt?: Date
  updatedAt?: Date
}
export interface IUser {
  _id?: string
  id?: number
  name: string
  email?: string
  phone?: string
  password?: string
  avatar?: TUserAvatar
  passwordChangeAt?: Date
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  addresses?: IUserAddress[]
  role: 'user' | 'admin' | 'superAdmin'
  status: 'active' | 'blocked'
  isDeleted: boolean
  provider?: AuthProvider
  providerId?: string
  createdAt?: Date
  updatedAt?: Date
  defaultShippingAddressId?: string
  defaultBillingAddressId?: string
}
