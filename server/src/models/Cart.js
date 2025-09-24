const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, trim: true },
    color: { type: String, trim: true },
    size: { type: String, trim: true },
  },
  { _id: false }
);

const CartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, index: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true }
);

CartSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Cart', CartSchema);
