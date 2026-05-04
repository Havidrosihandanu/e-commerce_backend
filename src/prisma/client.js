/**
 * Prisma Client Singleton
 * Export satu instance PrismaClient untuk digunakan di seluruh aplikasi
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

module.exports = prisma;
