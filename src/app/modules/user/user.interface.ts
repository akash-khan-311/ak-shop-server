/* eslint-disable prettier/prettier */
export interface IUser {
  _id?: string
  name: string
  email?: string
  phone?: string
  password?: string
  provider: 'local' | 'google' | 'facebook'
  providerId?: string
  profileCompleted: boolean
  createdAt?: Date
  updatedAt?: Date
}
export interface RegisterPayload {
  name: string
  email: string
  phone: string
  password: string
}
export interface SocialLoginPayload {
  name: string
  email: string
  provider: 'google' | 'facebook'
  providerId: string
}
