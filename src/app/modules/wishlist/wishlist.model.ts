import mongoose, { Schema } from 'mongoose'
import { TWishlist, TWishlistItem } from './wishlist.interface'

const wishlistItemSchema = new Schema<TWishlistItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: String, required: false, default: null },
    addedAt: { type: Date, required: false, default: Date.now },
  },
  { _id: false },
)

const wishlistSchema = new Schema<TWishlist>(
  {
    ownerType: { type: String, enum: ['user', 'guest'], required: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    guestIdForWishlist: { type: String, default: null, index: true },
    items: { type: [wishlistItemSchema], default: [] },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
)

wishlistSchema.index(
  { ownerType: 1, userId: 1 },
  { unique: true, sparse: true },
)
wishlistSchema.index(
  { ownerType: 1, guestIdForWishlist: 1 },
  { unique: true, sparse: true },
)

export const Wishlist =
  (mongoose.models.Wishlist as mongoose.Model<TWishlist>) ||
  mongoose.model<TWishlist>('Wishlist', wishlistSchema)
