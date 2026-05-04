/**
 * Product Controller
 * GET    /api/products       - daftar semua produk
 * GET    /api/products/:id   - detail produk
 * POST   /api/products       - create (admin only)
 * PUT    /api/products/:id   - update (admin only)
 * DELETE /api/products/:id   - delete (admin only)
 */

const prisma = require('../prisma/client');

/**
 * GET /api/products
 * Mendukung filter by category: ?category=CPU
 */
const getAllProducts = async (req, res, next) => {
    try {
        const { category } = req.query;

        const products = await prisma.product.findMany({
            where: category ? { category } : undefined,
            select: {
                id: true,
                name: true,
                price: true,
                category: true,
                stock: true,
                image_url: true,
            },
            orderBy: { category: 'asc' },
        });

        res.json({ products });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/products/:id
 */
const getProductById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);

        const product = await prisma.product.findUnique({ where: { id } });

        if (!product) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }

        res.json({ product });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/products (admin only)
 */
const createProduct = async (req, res, next) => {
    try {
        const { name, price, category, stock, image_url, specs } = req.body;

        const product = await prisma.product.create({
            data: { name, price, category, stock, image_url, specs },
        });

        res.status(201).json({
            message: 'Produk berhasil dibuat',
            product,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/products/:id (admin only)
 */
const updateProduct = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const { name, price, category, stock, image_url, specs } = req.body;

        // Cek produk ada
        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }

        const product = await prisma.product.update({
            where: { id },
            data: { name, price, category, stock, image_url, specs },
        });

        res.json({
            message: 'Produk berhasil diupdate',
            product,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/products/:id (admin only)
 */
const deleteProduct = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);

        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }

        await prisma.product.delete({ where: { id } });

        res.json({ message: 'Produk berhasil dihapus' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
