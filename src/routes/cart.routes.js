/**
 * Cart Routes
 * GET    /api/cart       - customer only
 * POST   /api/cart       - customer only
 * PUT    /api/cart/:id   - customer only
 * DELETE /api/cart/:id   - customer only
 */

const express = require('express');
const router = express.Router();

const { getCart, addToCart, updateCartItem, removeCartItem } = require('../controllers/cart.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { addCartSchema, updateCartSchema } = require('../utils/schemas');

// Semua route cart: harus login
router.use(authenticate);

router.get('/', getCart);
router.post('/', validate(addCartSchema), addToCart);
router.put('/:id', validate(updateCartSchema), updateCartItem);
router.delete('/:id', removeCartItem);

module.exports = router;
