/**
 * Order Controller
 * POST   /api/orders              - checkout dari cart (customer)
 * GET    /api/orders/my           - riwayat order customer
 * GET    /api/orders/:id          - detail order
 * GET    /api/orders              - semua order (admin only)
 * PATCH  /api/orders/:id/status   - update status (admin only)
 */

const prisma = require('../prisma/client');

/**
 * POST /api/orders
 * Checkout seluruh item di cart menjadi satu order
 */
const createOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { shipping_address } = req.body;

        // Ambil semua item cart
        const cartItems = await prisma.cartItem.findMany({
            where: { userId },
            include: { product: true },
        });

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Keranjang belanja kosong' });
        }

        // Validasi stok semua item
        for (const item of cartItems) {
            if (item.product.stock < item.qty) {
                return res.status(400).json({
                    message: `Stok tidak cukup untuk produk "${item.product.name}". Tersedia: ${item.product.stock}`,
                });
            }
        }

        // Hitung total harga
        const totalPrice = cartItems.reduce(
            (sum, item) => sum + parseFloat(item.product.price) * item.qty,
            0
        );

        // Buat order dan order items dalam satu transaksi
        const order = await prisma.$transaction(async (tx) => {
            // 1. Buat order
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    totalPrice,
                    shippingAddress: shipping_address,
                    status: 'pending',
                    orderItems: {
                        create: cartItems.map((item) => ({
                            productName: item.product.name,
                            productPrice: item.product.price,
                            qty: item.qty,
                        })),
                    },
                },
            });

            // 2. Kurangi stok setiap produk
            for (const item of cartItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.qty } },
                });
            }

            // 3. Kosongkan cart user
            await tx.cartItem.deleteMany({ where: { userId } });

            return newOrder;
        });

        res.status(201).json({
            message: 'Order berhasil dibuat',
            order_id: order.id,
            total_price: totalPrice,
            status: order.status,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/orders/my
 * Riwayat pesanan milik customer yang login
 */
const getMyOrders = async (req, res, next) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.id },
            include: { orderItems: true },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ orders });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/orders/:id
 * Detail satu order (milik user atau admin)
 */
const getOrderById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);

        const order = await prisma.order.findUnique({
            where: { id },
            include: { orderItems: true, user: { select: { id: true, name: true, email: true } } },
        });

        if (!order) {
            return res.status(404).json({ message: 'Order tidak ditemukan' });
        }

        // Customer hanya boleh lihat order miliknya
        if (req.user.role === 'customer' && order.userId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: Bukan order Anda' });
        }

        res.json({ order });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/orders
 * Semua pesanan (admin only)
 */
const getAllOrders = async (req, res, next) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                orderItems: true,
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ orders });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/orders/:id/status
 * Update status order (admin only)
 */
const updateOrderStatus = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body;

        const order = await prisma.order.findUnique({ where: { id } });
        if (!order) {
            return res.status(404).json({ message: 'Order tidak ditemukan' });
        }

        const updated = await prisma.order.update({
            where: { id },
            data: { status },
        });

        res.json({
            message: 'Status order berhasil diupdate',
            order: { id: updated.id, status: updated.status },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
