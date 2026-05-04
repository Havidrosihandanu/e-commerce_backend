/**
 * Cart Controller
 * GET    /api/cart       - daftar item keranjang user
 * POST   /api/cart       - tambah item ke keranjang
 * PUT    /api/cart/:id   - update qty item
 * DELETE /api/cart/:id   - hapus item dari keranjang
 */

const prisma = require('../prisma/client');

/**
 * GET /api/cart
 * Mengembalikan semua item cart dengan subtotal per item
 */
const getCart = async (req, res, next) => {
    try {
        const cartItems = await prisma.cartItem.findMany({
            where: { userId: req.user.id },
            include: {
                product: {
                    select: { id: true, name: true, price: true, category: true, image_url: true, stock: true },
                },
            },
        });

        // Hitung subtotal per item
        const itemsWithSubtotal = cartItems.map((item) => ({
            id: item.id,
            product: item.product,
            qty: item.qty,
            subtotal: parseFloat(item.product.price) * item.qty,
        }));

        const totalPrice = itemsWithSubtotal.reduce((sum, item) => sum + item.subtotal, 0);

        res.json({
            items: itemsWithSubtotal,
            total_price: totalPrice,
            item_count: itemsWithSubtotal.length,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/cart
 * Tambah produk ke cart. Jika sudah ada, tambah qty-nya.
 */
const addToCart = async (req, res, next) => {
    try {
        const { product_id, qty } = req.body;
        const userId = req.user.id;

        // Cek produk ada dan cukup stock
        const product = await prisma.product.findUnique({ where: { id: product_id } });
        if (!product) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }
        if (product.stock < qty) {
            return res.status(400).json({ message: `Stok tidak cukup. Stok tersedia: ${product.stock}` });
        }

        // Cek apakah produk sudah ada di cart
        const existingItem = await prisma.cartItem.findUnique({
            where: { userId_productId: { userId, productId: product_id } },
        });

        let cartItem;
        if (existingItem) {
            // Sudah ada → update qty (tambah)
            const newQty = existingItem.qty + qty;
            if (product.stock < newQty) {
                return res.status(400).json({ message: `Stok tidak cukup. Stok tersedia: ${product.stock}` });
            }
            cartItem = await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { qty: newQty },
                include: { product: { select: { id: true, name: true, price: true } } },
            });
        } else {
            // Belum ada → buat baru
            cartItem = await prisma.cartItem.create({
                data: { userId, productId: product_id, qty },
                include: { product: { select: { id: true, name: true, price: true } } },
            });
        }

        res.status(201).json({
            message: 'Produk ditambahkan ke keranjang',
            cart_item: {
                id: cartItem.id,
                product: cartItem.product,
                qty: cartItem.qty,
                subtotal: parseFloat(cartItem.product.price) * cartItem.qty,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/cart/:id
 * Update qty item di cart
 */
const updateCartItem = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const { qty } = req.body;

        // Cek cart item milik user ini
        const cartItem = await prisma.cartItem.findFirst({
            where: { id, userId: req.user.id },
            include: { product: true },
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Item cart tidak ditemukan' });
        }

        // Cek stok
        if (cartItem.product.stock < qty) {
            return res.status(400).json({ message: `Stok tidak cukup. Stok tersedia: ${cartItem.product.stock}` });
        }

        const updated = await prisma.cartItem.update({
            where: { id },
            data: { qty },
            include: { product: { select: { id: true, name: true, price: true } } },
        });

        res.json({
            message: 'Qty berhasil diupdate',
            cart_item: {
                id: updated.id,
                product: updated.product,
                qty: updated.qty,
                subtotal: parseFloat(updated.product.price) * updated.qty,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/cart/:id
 * Hapus item dari cart
 */
const removeCartItem = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);

        const cartItem = await prisma.cartItem.findFirst({
            where: { id, userId: req.user.id },
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Item cart tidak ditemukan' });
        }

        await prisma.cartItem.delete({ where: { id } });

        res.json({ message: 'Item berhasil dihapus dari keranjang' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };
