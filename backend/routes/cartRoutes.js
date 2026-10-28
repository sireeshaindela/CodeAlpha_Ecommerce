const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');
const requireAuth = require('../middleware/requireAuth');
const { validateCartItem, validateObjectId } = require('../middleware/validateRequest');

// All cart routes require an authenticated user session
router.use(requireAuth);

router.get('/', cartController.getCart);
router.post('/items', validateCartItem, cartController.addItem);
router.patch('/items/:productId', validateObjectId('productId'), validateCartItem, cartController.updateQuantity);
router.delete('/items/:productId', validateObjectId('productId'), cartController.removeItem);
router.delete('/', cartController.clearCart);

module.exports = router;
