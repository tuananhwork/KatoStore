const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AddressSchema = new mongoose.Schema(
  {
    street: { type: String, trim: true },
    ward: { type: String, trim: true },
    district: { type: String, trim: true },
    city: { type: String, trim: true },
    postalCode: { type: String, trim: true },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'customer'],
      default: 'customer',
      index: true,
    },
    passwordHash: { type: String, required: true },

    // Optional profile fields
    phone: { type: String, trim: true },
    avatar: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
    },
    address: { type: AddressSchema, default: () => ({}) },

    // Status/metadata
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    // For future features like email verification / reset password
    emailVerifiedAt: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpiresAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(doc, ret) {
        delete ret.passwordHash;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform(doc, ret) {
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

UserSchema.index({ createdAt: -1 });

UserSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

UserSchema.methods.setPassword = async function setPassword(plain) {
  this.passwordHash = await bcrypt.hash(plain, 10);
};

UserSchema.statics.hashPassword = function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
};

module.exports = mongoose.model('User', UserSchema);
