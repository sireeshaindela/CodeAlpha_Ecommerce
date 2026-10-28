const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not a valid integer quantity'
      }
    }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true
    },
    items: [cartItemSchema]
  },
  {
    timestamps: true
  }
);

// Method to ensure duplicate product IDs are merged inside the cart
cartSchema.methods.addItem = function (productId, quantity) {
  const existingIndex = this.items.findIndex(
    (item) => item.product.toString() === productId.toString()
  );

  if (existingIndex > -1) {
    this.items[existingIndex].quantity += quantity;
  } else {
    this.items.push({ product: productId, quantity });
  }
};

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
