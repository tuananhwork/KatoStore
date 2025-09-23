const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    type: { type: String, enum: ['order-created', 'order-status-changed'], required: true },
    title: { type: String, trim: true },
    message: { type: String, trim: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    read: { type: Boolean, default: false },
    meta: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
