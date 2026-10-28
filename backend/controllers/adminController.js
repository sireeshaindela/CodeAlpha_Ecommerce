const Product = require('../models/Product');
const Order = require('../models/Order');

/**
 * Admin: Create a new product
 * POST /api/admin/products
 */
async function createProduct(req, res, next) {
  try {
    const { name, description, price, category, imageUrl, stockQuantity, featured } = req.body;

    if (!name || !description || price === undefined || !category || !imageUrl || stockQuantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, description, price, category, imageUrl, stockQuantity) are required.'
      });
    }

    const product = new Product({
      name: name.trim(),
      description: description.trim(),
      price: Math.round(Number(price)), // Ensure integer paise
      category: category.trim(),
      imageUrl: imageUrl.trim(),
      stockQuantity: Math.max(0, parseInt(stockQuantity, 10)),
      featured: Boolean(featured)
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Update product details, pricing, or stock
 * PATCH /api/admin/products/:id
 */
async function updateProduct(req, res, next) {
  try {
    const updates = { ...req.body };

    if (updates.price !== undefined) {
      updates.price = Math.round(Number(updates.price));
    }
    if (updates.stockQuantity !== undefined) {
      updates.stockQuantity = Math.max(0, parseInt(updates.stockQuantity, 10));
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Deactivate / Delete a product
 * DELETE /api/admin/products/:id
 */
async function deleteProduct(req, res, next) {
  try {
    // Soft-deactivate product so existing orders still retain reference
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deactivated successfully.',
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Get all orders across the system
 * GET /api/admin/orders
 */
async function getAllOrders(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) {
      filter.orderStatus = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Update order status (e.g. processing, shipped, delivered)
 * PATCH /api/admin/orders/:id/status
 */
async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const validStatuses = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to "${status}".`,
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus
};
