const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { calculateOrderTotals } = require('../services/orderService');

/**
 * Helper to format cart response with recalculated monetary totals
 */
function formatCartResponse(cart) {
  const items = [];
  let totalItemsCount = 0;

  for (const item of cart.items) {
    if (item.product && item.product.isActive) {
      const itemSubtotal = item.product.price * item.quantity;
      totalItemsCount += item.quantity;

      items.push({
        product: {
          _id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          imageUrl: item.product.imageUrl,
          stockQuantity: item.product.stockQuantity,
          category: item.product.category
        },
        quantity: item.quantity,
        subtotal: itemSubtotal
      });
    }
  }

  const totals = calculateOrderTotals(
    items.map((i) => ({ price: i.product.price, quantity: i.quantity }))
  );

  return {
    items,
    totalItems: totalItemsCount,
    subtotal: totals.subtotal,
    shippingFee: totals.shippingFee,
    total: totals.total,
    freeShippingThreshold: totals.freeShippingThreshold,
    isFreeShippingEligible: totals.isFreeShippingEligible
  };
}

/**
 * Get current user's shopping cart
 * GET /api/cart
 */
async function getCart(req, res, next) {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const formattedCart = formatCartResponse(cart);
    res.status(200).json({
      success: true,
      data: {
        cart: formattedCart
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Add an item to the user's cart
 * POST /api/cart/items
 */
async function addItem(req, res, next) {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = parseInt(quantity, 10);

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unavailable.'
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    const currentQtyInCart = existingItemIndex > -1 ? cart.items[existingItemIndex].quantity : 0;
    const requestedTotalQty = currentQtyInCart + qty;

    if (requestedTotalQty > product.stockQuantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stockQuantity} item(s) in stock. You already have ${currentQtyInCart} in your cart.`
      });
    }

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity = requestedTotalQty;
    } else {
      cart.items.push({ product: productId, quantity: qty });
    }

    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
      success: true,
      message: `Added "${product.name}" to cart.`,
      data: {
        cart: formatCartResponse(cart)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update quantity for an item in the cart
 * PATCH /api/cart/items/:productId
 */
async function updateQuantity(req, res, next) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const newQty = parseInt(quantity, 10);

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.'
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product is not in your cart.'
      });
    }

    if (newQty <= 0) {
      // Remove item if new quantity is 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Product no longer available.'
        });
      }

      if (newQty > product.stockQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stockQuantity} item(s) currently available in stock.`
        });
      }

      cart.items[itemIndex].quantity = newQty;
    }

    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
      success: true,
      message: 'Cart updated.',
      data: {
        cart: formatCartResponse(cart)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Remove an item from the cart
 * DELETE /api/cart/items/:productId
 */
async function removeItem(req, res, next) {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.'
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId.toString()
    );

    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
      data: {
        cart: formatCartResponse(cart)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Clear the entire shopping cart
 * DELETE /api/cart
 */
async function clearCart(req, res, next) {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart emptied.',
      data: {
        cart: {
          items: [],
          totalItems: 0,
          subtotal: 0,
          shippingFee: 0,
          total: 0,
          isFreeShippingEligible: false
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart
};
