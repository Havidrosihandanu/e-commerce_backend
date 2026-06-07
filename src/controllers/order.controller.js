/**
 * Order Controller
 * POST   /api/orders              - checkout dari cart (customer)
 * GET    /api/orders/my           - riwayat order customer
 * GET    /api/orders/:id          - detail order
 * GET    /api/orders              - semua order (admin only)
 * PATCH  /api/orders/:id/status   - update status (admin only)
 */

const prisma = require('../prisma/client');

const createOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { shipping_address } = req.body;

        const cartItems = await prisma.cartItem.findMany({
            where: { userId },
            include: { product: true },
        });

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Keranjang belanja kosong' });
        }

        for (const item of cartItems) {
            if (item.product.stock < item.qty) {
                return res.status(400).json({
                    message: `Stok tidak cukup untuk produk "${item.product.name}". Tersedia: ${item.product.stock}`,
                });
            }
        }

        const totalPrice = cartItems.reduce(
            (sum, item) => sum + parseFloat(item.product.price) * item.qty,
            0
        );

        const order = await prisma.$transaction(async (tx) => {
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

            for (const item of cartItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.qty } },
                });
            }

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

        if (req.user.role === 'customer' && order.userId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: Bukan order Anda' });
        }

        // PERBAIKAN: Kirim order secara langsung agar terbaca oleh Frontend Modal Detail
        res.json(order);
    } catch (error) {
        next(error);
    }
};

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

const updateOrderStatus = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body;

        const order = await prisma.order.findUnique({ where: { id } });
        if (!order) {
            return res.status(404).json({ message: 'Order tidak ditemukan' });
        }

        // PERBAIKAN: Beri akses bagi Customer untuk membatalkan pesanan miliknya
        if (req.user.role === 'customer') {
            if (order.userId !== req.user.id) {
                return res.status(403).json({ message: 'Akses ditolak' });
            }
            if (status !== 'dibatalkan') {
                return res.status(403).json({ message: 'Customer hanya dapat membatalkan pesanan' });
            }
            if (order.status !== 'pending') {
                return res.status(400).json({ message: 'Hanya pesanan pending yang bisa dibatalkan' });
            }
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