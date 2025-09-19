const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    type: { type: String, enum: ['image', 'video'], default: 'image' },
    order: { type: Number, default: 1 },
  },
  { _id: false }
);

const VariantSchema = new mongoose.Schema(
  {
    color: { type: String, trim: true },
    size: { type: String, trim: true },
    stock: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    // required *
    sku: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    }, // *
    name: { type: String, required: true, trim: true }, // *
    description: { type: String, default: '', trim: true },
    category: { type: String, required: true, trim: true, index: true }, // *

    brand: { type: String, trim: true },

    // required *
    price: { type: Number, required: true, min: 0 }, // *
    originalPrice: { type: Number, min: 0 },
    discount: { type: Number, min: 0, max: 100 },

    stock: { type: Number, default: 0, min: 0 },

    media: { type: [MediaSchema], default: [] },
    variants: { type: [VariantSchema], default: [] },

    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviews: { type: Number, min: 0, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  }
);

ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ name: 'text', description: 'text', sku: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
