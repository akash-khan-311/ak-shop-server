import mongoose, { Schema } from 'mongoose'
import { ICart, ICartItem } from './cart.interface'
const cartItemSchema = new Schema<ICartItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: { type: Number, min: 1, default: 1, required: true },
    variantId: { type: String, default: null },
  },
  { _id: false },
)

const cartSchema = new Schema<ICart>(
  {
    ownerType: {
      type: String,
      enum: ['user', 'guest'],
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    guestIdForCartItem: { type: String, default: null, index: true },

    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true },
)
cartSchema.index({ userId: 1 }, { unique: true, sparse: true })
cartSchema.index({ guestIdForCartItem: 1 }, { unique: true, sparse: true })
cartSchema.pre('save', function (next) {
  if (this.ownerType === 'user') {
    this.guestIdForCartItem = null
  }
  if (this.ownerType === 'guest') {
    this.userId = null
  }
  next()
})
export const Cart =
  (mongoose.models.Cart as mongoose.Model<ICart>) ||
  mongoose.model<ICart>('Cart', cartSchema)
