/* eslint-disable prettier/prettier */
import mongoose, { Schema } from 'mongoose'
import { IUser } from './user.interface'

const UserSchema = new Schema<IUser>(
  {
    // Local register
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true
    },

    phone: {
      type: String,
      unique: true,
      sparse: true
    },

    password: {
      type: String,
      select: false // hide password
    },

    // Auth provider
    provider: {
      type: String,
      enum: ['local', 'google', 'facebook'],
      default: 'local'
    },

    providerId: {
      type: String
    },
    profileCompleted: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
)

export const User = mongoose.models.User || mongoose.model('User', UserSchema)
