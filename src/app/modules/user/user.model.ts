import mongoose, { Schema } from 'mongoose'
import { IUser } from './user.interface'

const addressSchema = new Schema(
  {
    division: String,
    district: String,
    upazila: String,
    union: String,
    fullAddress: String
  },
  { _id: false }
)

const userSchema = new Schema(
  {
    id: { type: Number, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String },
    avatar: { type: String },
    dateOfBirth: { type: String },
    passwordChangeAt: { type: Date, default: null },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    address: { type: addressSchema, default: undefined },
    role: {
      type: String,
      enum: ['user', 'admin', 'superAdmin', 'vendor'],
      default: 'user'
    },
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active'
    },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

const existing = (
  mongoose.models as unknown as Record<string, mongoose.Model<IUser>>
).SpecTemplate

export const User = existing || mongoose.model<IUser>('User', userSchema)
