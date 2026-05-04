/**
 * Authentication Middleware
 * Memverifikasi JWT dari header Authorization
 */

const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');

/**
 * Middleware: authenticate
 * Cek dan decode JWT token dari header request
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized: Token tidak ditemukan' });
        }

        const token = authHeader.split(' ')[1];

        // Verifikasi token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Cek user masih ada di database
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, name: true, email: true, role: true },
        });

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User tidak ditemukan' });
        }

        // Simpan data user di request object
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Unauthorized: Token sudah expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Unauthorized: Token tidak valid' });
        }
        next(error);
    }
};

/**
 * Middleware: authorize
 * Membatasi akses hanya untuk role tertentu
 * Penggunaan: authorize('admin') atau authorize('admin', 'customer')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Forbidden: Hanya ${roles.join(' atau ')} yang dapat mengakses endpoint ini`,
            });
        }

        next();
    };
};

module.exports = { authenticate, authorize };
