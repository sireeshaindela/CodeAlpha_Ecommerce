const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [150, 'Product name cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true
    },
    // Stored as integer paise (e.g. ₹1,499.00 = 149900 paise) to avoid floating point math errors
    price: {
      type: Number,
      required: [true, 'Product price in paise is required'],
      min: [0, 'Price cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value in paise'
      }
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
      index: true
    },
    imageUrl: {
      type: String,
      required: [true, 'Product image URL is required'],
      trim: true
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    featured: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual helper for displaying in rupees (paise / 100)
productSchema.virtual('priceInRupees').get(function () {
  return (this.price / 100).toFixed(2);
});

// Compound text index for search across product names and descriptions
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
