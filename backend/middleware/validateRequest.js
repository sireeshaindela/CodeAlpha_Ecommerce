const mongoose = require('mongoose');

/**
 * Validate MongoDB ObjectId in request params
 */
function validateObjectId(paramName = 'id') {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid identifier provided: ${id}`
      });
    }
    next();
  };
}

/**
 * Validate registration input fields
 */
function validateRegistration(req, res, next) {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Full name is required.' });
  }

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'A valid email address is required.' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long.'
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match.'
    });
  }

  next();
}

/**
 * Validate login input fields
 */
function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Both email and password are required.'
    });
  }

  next();
}

/**
 * Validate cart item inputs
 */
function validateCartItem(req, res, next) {
  const { productId, quantity } = req.body;

  if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({
      success: false,
      message: 'A valid product ID is required.'
    });
  }

  if (quantity !== undefined) {
    const parsedQty = Number(quantity);
    if (!Number.isInteger(parsedQty) || parsedQty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer.'
      });
    }
    if (parsedQty > 50) {
      return res.status(400).json({
        success: false,
        message: 'Maximum allowable quantity per item is 50.'
      });
    }
  }

  next();
}

/**
 * Validate checkout shipping address inputs
 */
function validateShippingAddress(req, res, next) {
  const { shippingAddress } = req.body;

  if (!shippingAddress || typeof shippingAddress !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Shipping address details are required.'
    });
  }

  const requiredFields = ['fullName', 'street', 'city', 'state', 'postalCode', 'phone'];
  for (const field of requiredFields) {
    if (!shippingAddress[field] || String(shippingAddress[field]).trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: `Field '${field}' in shipping address is required.`
      });
    }
  }

  next();
}

module.exports = {
  validateObjectId,
  validateRegistration,
  validateLogin,
  validateCartItem,
  validateShippingAddress
};
