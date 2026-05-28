const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        id: String,
        name: String,
        image: String,
        price: Number,
        qty: Number,
        size: String,
        color: String,
      },
    ],
    address: {
      label: String,
      name: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      isDefault: Boolean,
    },
    paymentMethod: { type: String, default: 'COD' },
    couponCode: { type: String, default: null },
    breakdown: {
      subtotal: Number,
      deliveryFee: Number,
      discount: Number,
      gst: Number,
      total: Number,
    },
    status: { type: String, default: 'placed' },
    placedAt: { type: Date, default: Date.now },
    rider: {
      name: String,
      phone: String,
      rating: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
