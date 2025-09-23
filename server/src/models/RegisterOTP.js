const mongoose = require('mongoose');

const RegisterOTPSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true, unique: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

RegisterOTPSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('RegisterOTP', RegisterOTPSchema);
