/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import mongoose, { Schema } from "mongoose";
import { IUser } from "./user.interface";

const userAddressSchema = new Schema(
  {
    label: { type: String },
    type: { type: String, enum: ["shipping", "billing"], required: true },

    division: { type: String },
    district: { type: String },
    upazila: { type: String },
    union: { type: String },
    fullAddress: { type: String, required: true },

    phone: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userAvatarSchema = new Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String, default: null },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    id: { type: Number, unique: true, sparse: true, index: true },
    name: { type: String, required: true, trim: true },

    email: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    phone: { type: String, unique: true, sparse: true, trim: true },

    password: { type: String, select: false },
    avatar: { type: userAvatarSchema, default: undefined },

    dateOfBirth: { type: String },
    passwordChangeAt: { type: Date, default: null },
    gender: { type: String, enum: ["male", "female", "other"] },
    provider: { type: String, enum: ["local", "google", "facebook"], default: "local" },
    providerId: { type: String, index: true, sparse: true },
    addresses: { type: [userAddressSchema], default: [] },
    defaultShippingAddressId: { type: Schema.Types.ObjectId, default: null },
    defaultBillingAddressId: { type: Schema.Types.ObjectId, default: null },

    role: {
      type: String,
      enum: ["user", "admin", "superAdmin", "vendor"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  const doc = this as any;

  if (!Array.isArray(doc.addresses)) return next();

  (["shipping", "billing"] as const).forEach((t) => {
    const defaults = doc.addresses.filter((a: any) => a.type === t && a.isDefault);
    if (defaults.length > 1) {

      defaults.slice(0, -1).forEach((a: any) => (a.isDefault = false));
    }
  });

  next();
});


export const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", userSchema);
