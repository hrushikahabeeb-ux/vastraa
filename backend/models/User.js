const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, default: '', trim: true },
    email: { type: String, default: '', lowercase: true, trim: true, unique: true, sparse: true },
    phone: { type: String, default: '', unique: true, sparse: true },
    password: { type: String, default: '' },
    avatar: { type: String, default: null },
    wishlist: [{ type: String }],
    coupons: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
