const Order = require('../models/Order');
const { processOrderCheckout } = require('../services/orderService');

/**
 * Place a new order from current cart items
 * POST /api/orders
 */
async function createOrder(req, res, next) {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    const order = await processOrderCheckout({
      userId: req.user._id,
      shippingAddress,
      paymentMethod: paymentMethod || 'cash_on_delivery'
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Thank you for shopping with ShopEasy.',
      data: {
        order
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to place order.'
    });
  }
}

/**
 * Get all orders placed by the currently authenticated user
 * GET /api/orders/my-orders
 */
async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        orders
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single order details with ownership verification
 * GET /api/orders/:id
 */
async function getOrderById(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    // Ownership check: only order owner or administrator can view the order
    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById
};
