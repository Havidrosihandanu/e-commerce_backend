/**
 * User Controller
 * GET  /api/users/me
 * PUT  /api/users/me
 */

const prisma = require('../prisma/client');

/**
 * GET /api/users/me
 * Mengembalikan profil user yang sedang login
 */
const getProfile = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, role: true, no_telp: true, alamat: true, createdAt: true },
        });

        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        res.json({ user });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/users/me
 * Update profil user (nama, no_telp, alamat)
 */
const updateProfile = async (req, res, next) => {
    try {
        const { name, no_telp, alamat } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: { name, no_telp, alamat },
            select: { id: true, name: true, email: true, role: true, no_telp: true, alamat: true },
        });

        res.json({
            message: 'Profil berhasil diupdate',
            user: updatedUser,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getProfile, updateProfile };
