const Product = require('../models/Product');

/**
 * Get product list with search, category filtering, sorting, and pagination
 * GET /api/products
 */
async function getProducts(req, res, next) {
  try {
    const { search, category, sort, featured, page = 1, limit = 12 } = req.query;

    const filter = { isActive: true };

    // Search filter across name and description
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category.trim() && category.toLowerCase() !== 'all') {
      const sanitized = category.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.category = new RegExp(`^${sanitized}$`, 'i');
    }

    // Featured filter
    if (featured === 'true') {
      filter.featured = true;
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default newest
    if (sort === 'price_asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOptions = { price: -1 };
    } else if (sort === 'name_asc') {
      sortOptions = { name: 1 };
    } else if (sort === 'name_desc') {
      sortOptions = { name: -1 };
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNumber - 1) * limitNumber;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOptions).skip(skip).limit(limitNumber),
      Product.countDocuments(filter)
    ]);

    // Fetch distinct active categories for frontend filter bar
    const categories = await Product.distinct('category', { isActive: true });

    res.status(200).json({
      success: true,
      data: {
        products,
        total,
        page: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        limit: limitNumber,
        categories
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single product details by ID
 * GET /api/products/:id
 */
async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or is currently unavailable.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all available product categories
 * GET /api/products/categories
 */
async function getCategories(req, res, next) {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.status(200).json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProducts,
  getProductById,
  getCategories
};
