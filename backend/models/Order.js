const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true // Price in paise at time of purchase
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    subtotal: {
      type: Number,
      required: true // quantity * price in paise
    },
    imageUrl: {
      type: String
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'India' },
      phone: { type: String, required: true }
    },
    subtotal: {
      type: Number,
      required: true // in paise
    },
    shippingFee: {
      type: Number,
      required: true // in paise
    },
    total: {
      type: Number,
      required: true // subtotal + shippingFee in paise
    },
    paymentMethod: {
      type: String,
      enum: ['cash_on_delivery', 'demo_checkout'],
      default: 'cash_on_delivery'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'refunded'],
      default: 'pending'
    },
    orderStatus: {
      type: String,
      enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'placed'
    }
  },
  {
    timestamps: true
  }
);

// Virtuals for displaying rupee equivalents
orderSchema.virtual('subtotalRupees').get(function () {
  return (this.subtotal / 100).toFixed(2);
});

orderSchema.virtual('shippingFeeRupees').get(function () {
  return (this.shippingFee / 100).toFixed(2);
});

orderSchema.virtual('totalRupees').get(function () {
  return (this.total / 100).toFixed(2);
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
