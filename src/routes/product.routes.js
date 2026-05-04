/**
 * Product Routes
 * GET    /api/products       - public
 * GET    /api/products/:id   - public
 * POST   /api/products       - admin only
 * PUT    /api/products/:id   - admin only
 * DELETE /api/products/:id   - admin only
 */

const express = require('express');
const router = express.Router();

const {
    getAllProducts, getProductById, createProduct, updateProduct, deleteProduct,
} = require('../controllers/product.controller');

const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { productSchema, updateProductSchema } = require('../utils/schemas');

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin only routes
router.post(
    '/',
    authenticate,
    authorize('admin'),
    validate(productSchema),
    createProduct
);

router.put(
    '/:id',
    authenticate,
    authorize('admin'),
    validate(updateProductSchema),
    updateProduct
);

router.delete(
    '/:id',
    authenticate,
    authorize('admin'),
    deleteProduct
);

module.exports = router;
