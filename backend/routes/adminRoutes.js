const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const requireAuth = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');
const { validateObjectId } = require('../middleware/validateRequest');

// All administrative endpoints require both authentication and the admin role
router.use(requireAuth, requireAdmin);

// Product management
router.post('/products', adminController.createProduct);
router.patch('/products/:id', validateObjectId('id'), adminController.updateProduct);
router.delete('/products/:id', validateObjectId('id'), adminController.deleteProduct);

// Order management
router.get('/orders', adminController.getAllOrders);
router.patch('/orders/:id/status', validateObjectId('id'), adminController.updateOrderStatus);

module.exports = router;
