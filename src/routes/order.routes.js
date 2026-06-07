/**
 * Order Routes
 * POST   /api/orders              - customer: checkout dari cart
 * GET    /api/orders/my           - customer: riwayat pesanan
 * GET    /api/orders/:id          - customer/admin: detail order
 * GET    /api/orders              - admin only: semua pesanan
 * PATCH  /api/orders/:id/status   - shared: admin update status, customer batalkan pesanan
 */

const express = require('express');
const router = express.Router();

const {
    createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus,
} = require('../controllers/order.controller');

const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createOrderSchema, updateOrderStatusSchema } = require('../utils/schemas');

// Semua route order: harus login
router.use(authenticate);

// Customer routes (PENTING: /my harus sebelum /:id agar tidak di-capture sebagai ID)
router.post('/', validate(createOrderSchema), createOrder);
router.get('/my', getMyOrders);

// Admin only
router.get('/', authorize('admin'), getAllOrders);

// Shared: customer bisa lihat ordernya, admin bisa lihat semua
router.get('/:id', getOrderById);

// PERBAIKAN: Menghapus authorize('admin') agar Customer bisa membatalkan pesanan.
// Keamanan sudah dihandle otomatis di dalam fungsi updateOrderStatus di controller.
router.patch('/:id/status', validate(updateOrderStatusSchema), updateOrderStatus);

module.exports = router;