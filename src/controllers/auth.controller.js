/**
 * Auth Controller
 * POST /api/auth/register
 * POST /api/auth/login
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');

/**
 * Register user baru (role default: customer)
 */
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Cek apakah email sudah dipakai
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email sudah terdaftar' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Buat user baru
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
            select: { id: true, name: true, email: true, role: true },
        });

        res.status(201).json({
            message: 'Register success',
            user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login dan dapatkan JWT token
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Cari user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        // Verifikasi password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login };
