const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const requireAuth = require('../middleware/requireAuth');
const { validateShippingAddress, validateObjectId } = require('../middleware/validateRequest');

// All order operations require authentication
router.use(requireAuth);

router.post('/', validateShippingAddress, orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', validateObjectId('id'), orderController.getOrderById);

module.exports = router;
