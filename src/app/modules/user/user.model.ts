/* eslint-disable prettier/prettier */
import mongoose, { Schema } from 'mongoose'
import { IAddress, IUser } from './user.interface'

const addressSchema = new Schema<IAddress>(
  {
    division: String,
    district: String,
    upazila: String,
    union: String,
    fullAddress: String
  },
  { _id: false }
)

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String },
    avatar: String,
    dateOfBirth: String,
    passwordChangeAt: { type: Date, default: null },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    address: addressSchema,
    role: {
      type: String,
      enum: ['user', 'admin', 'superAdmin', 'vendor'],
      default: 'user'
    },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

export const User = mongoose.models.User || mongoose.model('User', userSchema)
