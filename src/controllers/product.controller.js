/**
 * Product Controller
 * GET    /api/products       - daftar semua produk
 * GET    /api/products/:id   - detail produk
 * POST   /api/products       - create (admin only)
 * PUT    /api/products/:id   - update (admin only)
 * DELETE /api/products/:id   - delete (admin only)
 */

const prisma = require('../prisma/client');
const { uploadToS3 } = require('../utils/s3');
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

const createProduct = async (req, res, next) => {
    try {
        const { name, price, category, stock, specs } = req.body;
        let finalImageUrl = req.body.image_url || '';

        if (req.file) {
            finalImageUrl = await uploadToS3(req.file);
        }

        const safeJsonSpecs = specs ? { deskripsi: String(specs) } : { deskripsi: "" };

        const product = await prisma.product.create({
            data: { 
                name: String(name || 'Produk Baru'), 
                price: parseFloat(price) || 0, 
                category: String(category || 'Umum'), 
                stock: parseInt(stock, 10) || 0, 
                image_url: String(finalImageUrl), 
                specs: safeJsonSpecs 
            },
        });

        return res.status(201).json({
            message: 'Produk berhasil dibuat dan disimpan ke S3 Cloud',
            product,
        });
    } catch (error) {
        console.error("❌ ERROR DATABASE PRISMA:", error);
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const { name, price, category, stock, specs } = req.body;

        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }

        let finalImageUrl = req.body.image_url || existing.image_url;
        if (req.file) {
            finalImageUrl = await uploadToS3(req.file);
        }

        let safeJsonSpecs = undefined;
        if (specs !== undefined) {
            safeJsonSpecs = { deskripsi: String(specs) };
        }

        const product = await prisma.product.update({
            where: { id },
            data: { 
                name: name ? String(name) : undefined, 
                price: price ? parseFloat(price) : undefined, 
                category: category ? String(category) : undefined, 
                stock: stock ? parseInt(stock, 10) : undefined, 
                image_url: finalImageUrl, 
                specs: safeJsonSpecs
            },
        });

        return res.json({
            message: 'Produk berhasil diupdate beserta berkas S3-nya',
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
