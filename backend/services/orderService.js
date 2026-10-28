const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

const FREE_SHIPPING_THRESHOLD_PAISE = parseInt(process.env.FREE_SHIPPING_THRESHOLD_PAISE, 10) || 200000; // ₹2,000
const STANDARD_SHIPPING_FEE_PAISE = parseInt(process.env.STANDARD_SHIPPING_FEE_PAISE, 10) || 9900;       // ₹99

/**
 * Calculates cart subtotal, shipping fee, and grand total in paise.
 * Free shipping if subtotal >= ₹2,000 (200000 paise), else ₹99 (9900 paise).
 */
function calculateOrderTotals(items) {
  let subtotal = 0;

  for (const item of items) {
    const itemSubtotal = item.price * item.quantity;
    subtotal += itemSubtotal;
  }

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD_PAISE || subtotal === 0 ? 0 : STANDARD_SHIPPING_FEE_PAISE;
  const total = subtotal + shippingFee;

  return {
    subtotal,
    shippingFee,
    total,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD_PAISE,
    isFreeShippingEligible: subtotal >= FREE_SHIPPING_THRESHOLD_PAISE
  };
}

/**
 * Generates an intuitive human-readable order number: e.g. ORD-20261028-XXXX
 */
function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `SE-${dateStr}-${randomSuffix}`;
}

/**
 * Validates inventory availability for an array of items.
 * Fetches fresh product data from the database to guarantee prices and stock levels.
 */
async function validateCartAndStock(cartItems) {
  if (!cartItems || cartItems.length === 0) {
    throw new Error('Your cart is empty.');
  }

  const validatedItems = [];

  for (const item of cartItems) {
    const productId = item.product._id ? item.product._id : item.product;
    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      throw new Error(`Product "${product ? product.name : 'Unknown'}" is no longer available.`);
    }

    if (product.stockQuantity < item.quantity) {
      throw new Error(
        `Insufficient stock for "${product.name}". Requested: ${item.quantity}, Available: ${product.stockQuantity}`
      );
    }

    validatedItems.push({
      product: product._id,
      name: product.name,
      price: product.price, // Authoritative price from DB in paise
      quantity: item.quantity,
      subtotal: product.price * item.quantity,
      imageUrl: product.imageUrl
    });
  }

  return validatedItems;
}

/**
 * Process order creation with atomic inventory deduction:
 * 1. Validates cart items and fresh stock
 * 2. Conditionally decrements product stock using atomic findOneAndUpdate with stock >= requested
 *    If concurrent order snatched stock, reverts previous decrements and throws error
 * 3. Creates the Order document in MongoDB
 * 4. Empties the user's cart
 */
async function processOrderCheckout({ userId, shippingAddress, paymentMethod = 'cash_on_delivery' }) {
  // 1. Fetch user's cart
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart || !cart.items || cart.items.length === 0) {
    throw new Error('Cannot checkout an empty cart.');
  }

  // 2. Validate current prices and stock
  const validatedItems = await validateCartAndStock(cart.items);
  const totals = calculateOrderTotals(validatedItems);

  // 3. Atomically decrement stock
  const decrementedProducts = [];
  try {
    for (const item of validatedItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,
          stockQuantity: { $gte: item.quantity }
        },
        {
          $inc: { stockQuantity: -item.quantity }
        },
        { new: true }
      );

      if (!updatedProduct) {
        throw new Error(`Could not reserve stock for item "${item.name}". Another customer may have just ordered it.`);
      }

      decrementedProducts.push({
        productId: item.product,
        quantity: item.quantity
      });
    }

    // 4. Create Order
    const orderNumber = generateOrderNumber();
    const order = new Order({
      orderNumber,
      user: userId,
      items: validatedItems,
      shippingAddress,
      subtotal: totals.subtotal,
      shippingFee: totals.shippingFee,
      total: totals.total,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'completed',
      orderStatus: 'placed'
    });

    await order.save();

    // 5. Clear user's cart now that order is saved
    cart.items = [];
    await cart.save();

    return order;
  } catch (error) {
    // Compensating transaction rollback: restore any stock decremented before failure
    for (const item of decrementedProducts) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockQuantity: item.quantity }
      });
    }
    throw error;
  }
}

module.exports = {
  calculateOrderTotals,
  generateOrderNumber,
  validateCartAndStock,
  processOrderCheckout,
  FREE_SHIPPING_THRESHOLD_PAISE,
  STANDARD_SHIPPING_FEE_PAISE
};
