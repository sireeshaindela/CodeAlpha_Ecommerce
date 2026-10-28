const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const { validateObjectId } = require('../middleware/validateRequest');

router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/:id', validateObjectId('id'), productController.getProductById);

module.exports = router;
