/**
 * Global Error Handler Middleware
 * Menangani semua error yang di-throw/next() dari controller
 */

const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err);

    // Prisma - Record not found
    if (err.code === 'P2025') {
        return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    // Prisma - Unique constraint violation
    if (err.code === 'P2002') {
        const field = err.meta?.target?.join(', ') || 'field';
        return res.status(400).json({ message: `Duplikat data: ${field} sudah digunakan` });
    }

    // Prisma - Foreign key constraint
    if (err.code === 'P2003') {
        return res.status(400).json({ message: 'Referensi data tidak valid' });
    }

    // Default 500
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
    });
};

module.exports = { errorHandler };
