/* eslint-disable prettier/prettier */
export type AuthProvider = 'local' | 'google' | 'facebook'
export interface IAddress {
  division?: string
  district?: string
  upazila?: string
  union?: string
  fullAddress?: string
}

export interface IUser {
  name: string
  email?: string
  phone?: string
  password?: string
  avatar?: string
  passwordChangeAt?: Date
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  address?: IAddress
  role: 'user' | 'admin' | 'superAdmin' | 'vendor'
  status: 'active' | 'blocked'
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}
