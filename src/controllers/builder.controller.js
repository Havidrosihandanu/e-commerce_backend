/**
 * PC Builder Controller
 * GET  /api/builder/components  - semua komponen per kategori
 * POST /api/builder/validate    - validasi kompatibilitas
 * POST /api/builder             - simpan build (customer)
 * GET  /api/builder/my          - daftar build milik customer
 * POST /api/builder/checkout    - checkout dari build
 */

const prisma = require('../prisma/client');
const { validateCompatibility, calculateTotalPrice } = require('../utils/compatibility');

// Field yang disertakan saat mengambil produk komponen
const COMPONENT_SELECT = {
    id: true, name: true, price: true, category: true, stock: true, image_url: true, specs: true,
};

/**
 * Helper: ambil produk berdasarkan ID, kembalikan null jika tidak ada
 */
async function findComponent(id) {
    if (!id) return null;
    return prisma.product.findUnique({ where: { id }, select: COMPONENT_SELECT });
}

/**
 * GET /api/builder/components
 * Mengembalikan semua komponen PC dikelompokkan per kategori
 * Opsional filter: ?cpu_id=1 untuk filter motherboard/RAM kompatibel
 */
const getComponents = async (req, res, next) => {
    try {
        const { cpu_id } = req.query;
        const pcCategories = ['CPU', 'Motherboard', 'RAM', 'Storage', 'GPU', 'PSU', 'Casing'];

        const products = await prisma.product.findMany({
            where: { category: { in: pcCategories }, stock: { gt: 0 } },
            select: COMPONENT_SELECT,
            orderBy: [{ category: 'asc' }, { price: 'asc' }],
        });

        // Kelompokkan per kategori
        const grouped = {};
        for (const cat of pcCategories) {
            grouped[cat] = [];
        }

        // Jika ada cpu_id, kita ambil datanya hanya untuk informasi (tanpa memfilter ketat)
        let cpu = null;
        if (cpu_id) {
            cpu = await findComponent(parseInt(cpu_id));
        }

        // Masukkan SEMUA produk ke dalam kelompoknya tanpa memfilter specs JSON
        for (const product of products) {
            grouped[product.category].push(product);
        }

        res.json({
            components: grouped,
            filtered_by_cpu: cpu ? { id: cpu.id, name: cpu.name } : null,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/builder/validate
 * Validasi kompatibilitas komponen yang dipilih
 */
const validateBuild = async (req, res, next) => {
    try {
        const { cpu_id, motherboard_id, ram_id, storage_id, gpu_id, psu_id, casing_id } = req.body;

        // Ambil semua komponen dari DB
        const [cpu, motherboard, ram, storage, gpu, psu, casing] = await Promise.all([
            findComponent(cpu_id),
            findComponent(motherboard_id),
            findComponent(ram_id),
            findComponent(storage_id),
            findComponent(gpu_id),
            findComponent(psu_id),
            findComponent(casing_id),
        ]);

        if (!cpu) {
            return res.status(400).json({ message: 'CPU wajib dipilih terlebih dahulu' });
        }

        // Validasi kategori komponen
        const categoryMap = { cpu: 'CPU', motherboard: 'Motherboard', ram: 'RAM', storage: 'Storage', gpu: 'GPU', psu: 'PSU', casing: 'Casing' };
        const components = { cpu, motherboard, ram, storage, gpu, psu, casing };

        for (const [key, product] of Object.entries(components)) {
            if (product && product.category !== categoryMap[key]) {
                return res.status(400).json({ message: `Produk '${product.name}' bukan kategori ${categoryMap[key]}` });
            }
        }

        const { compatible, issues } = validateCompatibility(components);
        const totalPrice = calculateTotalPrice(components);

        res.json({
            compatible,
            message: compatible ? 'Semua komponen kompatibel ✅' : 'Terdapat masalah kompatibilitas ❌',
            issues: issues,
            total_price: totalPrice,
            components: {
                cpu: cpu ? { id: cpu.id, name: cpu.name, price: cpu.price } : null,
                motherboard: motherboard ? { id: motherboard.id, name: motherboard.name, price: motherboard.price } : null,
                ram: ram ? { id: ram.id, name: ram.name, price: ram.price } : null,
                storage: storage ? { id: storage.id, name: storage.name, price: storage.price } : null,
                gpu: gpu ? { id: gpu.id, name: gpu.name, price: gpu.price } : null,
                psu: psu ? { id: psu.id, name: psu.name, price: psu.price } : null,
                casing: casing ? { id: casing.id, name: casing.name, price: casing.price } : null,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/builder
 * Simpan rakitan PC tanpa checkout
 */
const createBuild = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name, cpu_id, motherboard_id, ram_id, storage_id, gpu_id, psu_id, casing_id } = req.body;

        // Ambil semua komponen
        const [cpu, motherboard, ram, storage, gpu, psu, casing] = await Promise.all([
            findComponent(cpu_id),
            findComponent(motherboard_id),
            findComponent(ram_id),
            findComponent(storage_id),
            findComponent(gpu_id),
            findComponent(psu_id),
            findComponent(casing_id),
        ]);

        if (!cpu) {
            return res.status(400).json({ message: 'CPU tidak ditemukan' });
        }
        if (cpu.category !== 'CPU') {
            return res.status(400).json({ message: 'Produk yang dipilih bukan CPU' });
        }

        const components = { cpu, motherboard, ram, storage, gpu, psu, casing };

        // Validasi kompatibilitas sebelum menyimpan
        const { compatible, issues } = validateCompatibility(components);
        if (!compatible) {
            return res.status(400).json({
                message: 'Build tidak dapat disimpan karena ada masalah kompatibilitas',
                issues,
            });
        }

        const totalPrice = calculateTotalPrice(components);

        const build = await prisma.pCBuild.create({
            data: {
                userId,
                name: name || `Build #${Date.now()}`,
                cpuId: cpu_id,
                motherboardId: motherboard_id || null,
                ramId: ram_id || null,
                storageId: storage_id || null,
                gpuId: gpu_id || null,
                psuId: psu_id || null,
                casingId: casing_id || null,
                totalPrice,
            },
            include: {
                cpu: { select: { id: true, name: true, price: true } },
                motherboard: { select: { id: true, name: true, price: true } },
                ram: { select: { id: true, name: true, price: true } },
                storage: { select: { id: true, name: true, price: true } },
                gpu: { select: { id: true, name: true, price: true } },
                psu: { select: { id: true, name: true, price: true } },
                casing: { select: { id: true, name: true, price: true } },
            },
        });

        res.status(201).json({
            message: 'Rakitan PC berhasil disimpan',
            build,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/builder/my
 * Daftar semua build milik customer yang login
 */
const getMyBuilds = async (req, res, next) => {
    try {
        const builds = await prisma.pCBuild.findMany({
            where: { userId: req.user.id },
            include: {
                cpu: { select: { id: true, name: true, price: true } },
                motherboard: { select: { id: true, name: true, price: true } },
                ram: { select: { id: true, name: true, price: true } },
                storage: { select: { id: true, name: true, price: true } },
                gpu: { select: { id: true, name: true, price: true } },
                psu: { select: { id: true, name: true, price: true } },
                casing: { select: { id: true, name: true, price: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ builds });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/builder/checkout
 * Checkout dari build yang tersimpan → membuat Order
 */
const checkoutBuild = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { build_id, shipping_address } = req.body;

        // Ambil build
        const build = await prisma.pCBuild.findFirst({
            where: { id: build_id, userId },
            include: {
                cpu: true,
                motherboard: true,
                ram: true,
                storage: true,
                gpu: true,
                psu: true,
                casing: true,
            },
        });

        if (!build) {
            return res.status(404).json({ message: 'Build tidak ditemukan' });
        }

        // Kumpulkan komponen yang ada
        const parts = [
            build.cpu,
            build.motherboard,
            build.ram,
            build.storage,
            build.gpu,
            build.psu,
            build.casing,
        ].filter(Boolean);

        // Validasi stok
        for (const part of parts) {
            if (part.stock < 1) {
                return res.status(400).json({ message: `Stok habis untuk komponen: ${part.name}` });
            }
        }

        // Validasi ulang kompatibilitas di server
        const components = {
            cpu: build.cpu,
            motherboard: build.motherboard,
            ram: build.ram,
            storage: build.storage,
            gpu: build.gpu,
            psu: build.psu,
            casing: build.casing,
        };
        const { compatible, issues } = validateCompatibility(components);
        if (!compatible) {
            return res.status(400).json({
                message: 'Checkout gagal: build tidak kompatibel',
                issues,
            });
        }

        // Buat order dari build dalam transaksi
        const order = await prisma.$transaction(async (tx) => {
            // 1. Buat order
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    totalPrice: build.totalPrice,
                    shippingAddress: shipping_address,
                    status: 'pending',
                    orderItems: {
                        create: parts.map((part) => ({
                            productName: part.name,
                            productPrice: part.price,
                            qty: 1,
                        })),
                    },
                },
            });

            // 2. Kurangi stok
            for (const part of parts) {
                await tx.product.update({
                    where: { id: part.id },
                    data: { stock: { decrement: 1 } },
                });
            }

            return newOrder;
        });

        res.status(201).json({
            message: 'Checkout build berhasil',
            order_id: order.id,
            status: order.status,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getComponents, validateBuild, createBuild, getMyBuilds, checkoutBuild };
